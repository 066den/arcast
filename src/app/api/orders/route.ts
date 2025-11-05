import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createNotionOrderEntry, createNotionLeadEntry } from '@/lib/notion'
import { z } from 'zod'
import { validateOrder } from '@/lib/schemas'
import { OrderFormData, OrderResponse } from '@/types/api'
import { getPaymentLinkForOrder } from '@/services/paymentServices'
import {
  DISCOUNT_TYPE,
  ERROR_MESSAGES,
  HTTP_STATUS,
  ORDER_STATUS,
  VAT_RATE,
} from '@/lib/constants'
import { Decimal } from '@prisma/client/runtime/library'

function calculateBaseCost(price: number, quantity: number): number {
  return parseFloat(price.toString()) * quantity
}

export async function POST(req: Request) {
  try {
    const body: OrderFormData = await req.json()

    const validatedData = validateOrder(body)

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

    const { serviceId, discountCode, lead } = body

    let serviceData: any = null
    if (serviceId) {
      serviceData = await prisma.service.findUnique({
        where: { id: serviceId },
      })

      if (!serviceData) {
        return NextResponse.json(
          { success: false, error: ERROR_MESSAGES.SERVICE.NOT_FOUND },
          { status: HTTP_STATUS.NOT_FOUND }
        )
      }
    }

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

    const baseCost = calculateBaseCost(
      serviceData ? parseFloat(serviceData.price.toString()) : 0,
      1
    )

    const discountAmount = validatedDiscount
      ? validatedDiscount.type === DISCOUNT_TYPE.PERCENTAGE
        ? (baseCost * Number(validatedDiscount.value)) / 100
        : Number(validatedDiscount.value)
      : 0
    const costAfterDiscount = baseCost - Number(discountAmount)
    const finalVatAmount = (costAfterDiscount * VAT_RATE) / 100
    const finalTotalCost = costAfterDiscount + finalVatAmount

    const result = await prisma.$transaction(
      async (tx: any) => {
        let orderLead = await tx.lead.findFirst({
          where: {
            OR: [{ email: lead.email }, { phoneNumber: lead.phoneNumber }],
          },
        })

        if (!orderLead) {
          orderLead = await tx.lead.create({
            data: {
              fullName: lead.fullName,
              email: lead.email,
              phoneNumber: lead.phoneNumber,
              whatsappNumber: lead.whatsappNumber,
            },
          })
        } else {
          orderLead = await tx.lead.update({
            where: { id: orderLead.id },
            data: {
              fullName: lead.fullName,
              email: lead.email || lead.email,
              phoneNumber: lead.phoneNumber || lead.phoneNumber,
              whatsappNumber: lead.whatsappNumber || lead.whatsappNumber,
            },
          })
        }

        const order = await tx.order.create({
          data: {
            serviceName: serviceData ? serviceData.name : '',
            totalCost: finalTotalCost,
            finalAmount: finalTotalCost,
            discountAmount,
            leadId: orderLead.id,
            discountCodeId: validatedDiscount?.id,
            status: ORDER_STATUS.PENDING,
          },
          include: {
            lead: true,
            discountCode: true,
          },
        })

        if (validatedDiscount) {
          await tx.discountCode.update({
            where: { id: validatedDiscount.id },
            data: { usedCount: { increment: 1 } },
          })
        }

        return order
      },
      {
        timeout: 15000,
      }
    )

    // Create Notion entry
    try {
      await createNotionOrderEntry(result)

      // Also create lead entry if it's a new lead
      if (!result.lead.email || !result.lead.phoneNumber) {
        await createNotionLeadEntry(result.lead)
      }
    } catch {
      // Don't fail the entire request if Notion fails
    }

    const response: OrderResponse = {
      id: result.id,
      serviceName: result.serviceName,
      totalCost: parseFloat(result.totalCost.toString()),
      finalAmount: result.finalAmount
        ? parseFloat(result.finalAmount.toString())
        : undefined,
      discountAmount: result.discountAmount
        ? parseFloat(result.discountAmount.toString())
        : undefined,
      status: result.status,
      estimatedDays: result.estimatedDays ? result.estimatedDays : undefined,
      deadline: result.deadline ? result.deadline : undefined,
    }

    try {
      const paymentLink = await getPaymentLinkForOrder(result.id)
      if (paymentLink && paymentLink.paymentLink) {
        response.paymentUrl = `${paymentLink.paymentLink.payment_url}?embedded=true&parent_origin=${process.env.NEXT_PUBLIC_APP_URL}&enable_postmessage=true`
      } else {
      }
    } catch {
      return NextResponse.json(
        { success: false, error: ERROR_MESSAGES.PAYMENT.FAILED },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      )
    }

    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to create order',
      },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const skip = (page - 1) * limit

    const where = status ? { status: status as any } : {}

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          lead: true,
          discountCode: true,
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      orders: orders.map((order: any) => ({
        id: order.id,
        serviceName: order.serviceName,
        description: order.description,
        requirements: order.requirements,
        totalCost: parseFloat(order.totalCost.toString()),
        finalAmount: order.finalAmount
          ? parseFloat(order.finalAmount.toString())
          : null,
        discountAmount: order.discountAmount
          ? parseFloat(order.discountAmount.toString())
          : null,
        status: order.status,
        estimatedDays: order.estimatedDays,
        deadline: order.deadline,
        completedAt: order.completedAt,
        createdAt: order.createdAt,
        lead: {
          id: order.lead.id,
          fullName: order.lead.fullName,
          email: order.lead.email,
          phoneNumber: order.lead.phoneNumber,
          whatsappNumber: order.lead.whatsappNumber,
        },
        discountCode: order.discountCode,
        payment: order.payment,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
