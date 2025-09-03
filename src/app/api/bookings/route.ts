import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { BookingFormData } from '@/types/api'
import { z } from 'zod'
import { isSlotWithinWorkingHours } from '@/utils/time'
import { createNotionBookingEntry } from '@/lib/notion'
import {
  BOOKING_STATUS,
  DISCOUNT_TYPE,
  ERROR_MESSAGES,
  HTTP_STATUS,
  VAT_RATE,
} from '@/lib/constants'
import { validateBooking } from '@/lib/schemas'

// Helper function to calculate base cost
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
    const packageData = await prisma.studioPackage.findUnique({
      where: { id: packageId },
    })

    if (!packageData) {
      return NextResponse.json(
        { success: false, error: ERROR_MESSAGES.PACKAGE.NOT_FOUND },
        { status: HTTP_STATUS.NOT_FOUND }
      )
    }

    // Validate discount code
    let validatedDiscount: { id: string; type: string; value: number } | null =
      null
    console.log(discountCode)
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

      validatedDiscount = validDiscount
    }

    // Pre-fetch additional services to validate
    const additionalServicesData: Array<{
      additionalServiceId: string
      quantity: number
      price: string
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
          additionalServiceId: additionalService.id,
          quantity,
          price: additionalService.price,
        })
      }
    }

    // Calculate costs
    const baseCost = calculateBaseCost(
      parseFloat(packageData.price_per_hour.toString()),
      duration
    )
    const totalBeforeDiscount = baseCost + additionalServicesCost
    const discountAmount = validatedDiscount
      ? validatedDiscount.type === DISCOUNT_TYPE.PERCENTAGE
        ? (totalBeforeDiscount * validatedDiscount.value) / 100
        : validatedDiscount.value
      : 0
    const costAfterDiscount = totalBeforeDiscount - discountAmount
    const finalVatAmount = (costAfterDiscount * VAT_RATE) / 100
    const finalTotalCost = costAfterDiscount + finalVatAmount

    // 2. Now start a shorter transaction that only does essential writes
    const result = await prisma.$transaction(
      async tx => {
        // Handle lead creation/update
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
            discountCodeId: validatedDiscount?.id,
            status: BOOKING_STATUS.PENDING,
            studioId,
            packageId,
            leadId: bookingLead.id,
            additionalServices: {
              create: additionalServicesData,
            },
          },
          include: {
            studio: true,
            package: true,
            lead: true,
            discountCode: true,
            additionalServices: {
              include: {
                additionalService: true,
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

    // Format the response
    const formattedAdditionalServices = result.additionalServices.map(
      service => ({
        id: service.id,
        quantity: service.quantity,
        price: service.price,
        service: {
          id: service.additionalService.id,
          title: service.additionalService.title,
          type: service.additionalService.type,
          description: service.additionalService.description,
        },
      })
    )

    const response = {
      id: result.id,
      startTime: result.startTime,
      endTime: result.endTime,
      totalCost: parseFloat(result.totalCost.toString()),
      vatAmount: parseFloat(result.vatAmount.toString()),
      discountAmount: result.discountAmount
        ? parseFloat(result.discountAmount.toString())
        : 0,
      studio: {
        id: result.studio.id,
        name: result.studio.name,
      },
      package: {
        id: result.package.id,
        name: result.package.name,
      },
      lead: {
        id: result.lead.id,
        fullName: result.lead.fullName,
        email: result.lead.email,
        phoneNumber: result.lead.phoneNumber,
      },
      additionalServices: formattedAdditionalServices,
    }

    // Create Notion entry
    try {
      await createNotionBookingEntry(result)
    } catch (notionError) {
      console.error('Failed to create Notion entry:', notionError)
    }

    return NextResponse.json({ success: true, data: response })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.BOOKING.FAILED },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}
