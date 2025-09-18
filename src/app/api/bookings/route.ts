import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { BookingFormData, BookingResponse } from '@/types/api'
import { isSlotWithinWorkingHours } from '@/utils/time'
import { createNotionBookingEntry, createNotionLeadEntry } from '@/lib/notion'
import {
  BOOKING_STATUS,
  DISCOUNT_TYPE,
  ERROR_MESSAGES,
  HTTP_STATUS,
  VAT_RATE,
} from '@/lib/constants'
import { validateBooking } from '@/lib/schemas'
import { getPaymentLinkForBooking } from '@/services/paymentServices'
import { Decimal } from '@prisma/client/runtime/library'

function calculateBaseCost(pricePerHour: number, duration: number): number {
  return parseFloat(pricePerHour.toString()) * duration
}

export async function POST(req: Request) {
  try {
    const body: BookingFormData = await req.json()

    const validatedData = validateBooking(body)

    if (!validatedData.success) {
      return NextResponse.json(
        {
          error: ERROR_MESSAGES.INVALID_REQUEST,
          details: validatedData.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    const {
      studioId,
      packageId,
      numberOfSeats,
      selectedTime,
      duration,
      discountCode,
      additionalServices,
      lead,
    } = body

    const studio = await prisma.studio.findUnique({
      where: { id: studioId },
      select: {
        id: true,
        totalSeats: true,
        openingTime: true,
        closingTime: true,
        name: true,
      },
    })

    if (!studio) {
      return NextResponse.json(
        { success: false, error: ERROR_MESSAGES.STUDIO.NOT_FOUND },
        { status: HTTP_STATUS.NOT_FOUND }
      )
    }

    if (numberOfSeats > studio.totalSeats) {
      return NextResponse.json(
        { success: false, error: ERROR_MESSAGES.STUDIO.CAPACITY_EXCEEDED },
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    if (
      !isSlotWithinWorkingHours(
        selectedTime,
        duration,
        studio.openingTime,
        studio.closingTime
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: ERROR_MESSAGES.STUDIO.OUTSIDE_WORKING_HOURS,
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    // Calculate start and end time
    const startTime = new Date(selectedTime)
    const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000)

    // Check for existing bookings that overlap with the selected time
    const existingBookings = await prisma.booking.findMany({
      where: {
        studioId: studioId,
        status: { not: BOOKING_STATUS.CANCELLED },
        OR: [
          // Check if new booking starts during an existing booking
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          // Check if new booking ends during an existing booking
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          // Check if new booking completely contains an existing booking
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
      },
    })

    if (existingBookings.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: ERROR_MESSAGES.BOOKING.CONFLICT,
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    // Get package price
    const packageData = await prisma.package.findUnique({
      where: { id: packageId },
    })

    if (!packageData) {
      return NextResponse.json(
        { success: false, error: ERROR_MESSAGES.PACKAGE.NOT_FOUND },
        { status: HTTP_STATUS.NOT_FOUND }
      )
    }

    // Validate discount code
    let validatedDiscount: { id: string; type: string; value: Decimal } | null =
      null

    if (discountCode) {
      const validDiscount = await prisma.discountCode.findUnique({
        where: { code: discountCode },
      })

      if (
        !validDiscount ||
        !validDiscount.isActive ||
        validDiscount.endDate < new Date()
      ) {
        return NextResponse.json(
          { success: false, error: ERROR_MESSAGES.DISCOUNT.INVALID },
          { status: HTTP_STATUS.BAD_REQUEST }
        )
      }

      if (validDiscount.firstTimeOnly && lead.email) {
        const bookingsCount = await prisma.booking.count({
          where: { lead: { email: lead.email } },
        })

        if (bookingsCount > 0) {
          return NextResponse.json(
            {
              success: false,
              error: ERROR_MESSAGES.DISCOUNT.FIRST_TIME_ONLY,
            },
            { status: HTTP_STATUS.BAD_REQUEST }
          )
        }
      }

      validatedDiscount = {
        id: validDiscount.id,
        type: validDiscount.type,
        value: validDiscount.value,
      }
    }

    // Pre-fetch additional services to validate
    const additionalServicesData: Array<{
      serviceId: string
      quantity: number
      unitPrice: number
      totalPrice: number
    }> = []
    let additionalServicesCost = 0

    if (additionalServices && additionalServices.length > 0) {
      const serviceIds = additionalServices.map(service => service.id)
      const availableServices = await prisma.additionalService.findMany({
        where: {
          id: { in: serviceIds },
          isActive: true,
        },
      })

      const serviceMap = new Map()
      availableServices.forEach(service => {
        serviceMap.set(service.id, service)
      })

      for (const service of additionalServices) {
        const additionalService = serviceMap.get(service.id)

        if (!additionalService) {
          return NextResponse.json(
            { success: false, error: ERROR_MESSAGES.SERVICE.NOT_FOUND },
            { status: HTTP_STATUS.NOT_FOUND }
          )
        }

        const quantity = service.quantity || 1
        const serviceCost = parseFloat(additionalService.price) * quantity
        additionalServicesCost += serviceCost

        additionalServicesData.push({
          serviceId: additionalService.id,
          quantity,
          unitPrice: parseFloat(additionalService.price.toString()),
          totalPrice: serviceCost,
        })
      }
    }

    // Calculate costs
    const baseCost = calculateBaseCost(
      parseFloat(packageData.basePrice.toString()),
      duration
    )
    const totalBeforeDiscount = baseCost + additionalServicesCost
    const discountAmount = validatedDiscount
      ? validatedDiscount.type === DISCOUNT_TYPE.PERCENTAGE
        ? (totalBeforeDiscount * Number(validatedDiscount.value)) / 100
        : Number(validatedDiscount.value)
      : 0
    const costAfterDiscount = totalBeforeDiscount - Number(discountAmount)
    const finalVatAmount = (costAfterDiscount * VAT_RATE) / 100
    const finalTotalCost = costAfterDiscount + finalVatAmount

    // 2. Now start a shorter transaction that only does essential writes
    const result = await prisma.$transaction(
      async tx => {
        let bookingLead
        if (lead.email) {
          const existingLead = await tx.lead.findFirst({
            where: { email: lead.email },
          })

          bookingLead = existingLead
            ? await tx.lead.update({
                where: { id: existingLead.id },
                data: {
                  fullName: lead.fullName,
                  ...(lead.phoneNumber && { phoneNumber: lead.phoneNumber }),
                  ...(lead.recordingLocation && {
                    recordingLocation: lead.recordingLocation,
                  }),
                  ...(lead.whatsappNumber && {
                    whatsappNumber: lead.whatsappNumber,
                  }),
                },
              })
            : await tx.lead.create({
                data: {
                  fullName: lead.fullName,
                  email: lead.email,
                  ...(lead.phoneNumber && { phoneNumber: lead.phoneNumber }),
                  ...(lead.recordingLocation && {
                    recordingLocation: lead.recordingLocation,
                  }),
                  ...(lead.whatsappNumber && {
                    whatsappNumber: lead.whatsappNumber,
                  }),
                },
              })
        } else {
          bookingLead = await tx.lead.create({
            data: {
              fullName: lead.fullName,
              ...(lead.phoneNumber && { phoneNumber: lead.phoneNumber }),
              ...(lead.recordingLocation && {
                recordingLocation: lead.recordingLocation,
              }),
              ...(lead.whatsappNumber && {
                whatsappNumber: lead.whatsappNumber,
              }),
            },
          })
        }

        // Create booking
        const booking = await tx.booking.create({
          data: {
            startTime,
            endTime,
            numberOfSeats,
            totalCost: finalTotalCost,
            vatAmount: finalVatAmount,
            discountAmount,
            finalAmount: finalTotalCost,
            discountCodeId: validatedDiscount?.id,
            status: BOOKING_STATUS.PENDING,
            studioId,
            contentPackageId: packageId,
            leadId: bookingLead.id,
            bookingAdditionalServices: {
              create: additionalServicesData,
            },
          },
          include: {
            studio: true,
            contentPackage: true,
            lead: true,
            discountCode: true,
            bookingAdditionalServices: {
              include: {
                service: true,
              },
            },
          },
        })

        // Update discount usage if applicable
        if (validatedDiscount) {
          await tx.discountCode.update({
            where: { id: validatedDiscount.id },
            data: { usedCount: { increment: 1 } },
          })
        }

        return booking
      },
      {
        timeout: 15000, // Still use a higher timeout as a safety net
      }
    )

    const response: BookingResponse = {
      id: result.id,
      startTime: result.startTime,
      endTime: result.endTime,
      totalCost: parseFloat(result.totalCost.toString()),
      vatAmount: result.vatAmount ? parseFloat(result.vatAmount.toString()) : 0,
      discountAmount: result.discountAmount
        ? parseFloat(result.discountAmount.toString())
        : 0,
      finalAmount: result.finalAmount
        ? parseFloat(result.finalAmount.toString())
        : parseFloat(result.totalCost.toString()),
    }

    // Create Notion entry
    try {
      await createNotionBookingEntry(result)
      if (result.lead) {
        await createNotionLeadEntry(result.lead)
      }
    } catch (notionError) {
      console.error('Failed to create Notion entry:', notionError)
    }

    try {
      const paymentLink = await getPaymentLinkForBooking(result.id)
      if (paymentLink) {
        response.paymentUrl = `${paymentLink.paymentLink?.payment_url}?embedded=true&parent_origin=${process.env.NEXT_PUBLIC_APP_URL}&enable_postmessage=true`
      }
    } catch (error) {
      console.error('Failed to create payment link:', error)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.BOOKING.FAILED },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}
