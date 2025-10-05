import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createNotionOrderEntry, createNotionLeadEntry } from '@/lib/notion'
import { z } from 'zod'
import { orderSchema } from '@/lib/schemas'
import { OrderResponse } from '@/types/api'
import { OrderStatus } from '@prisma/client'
import {
  getPaymentLinkForBooking,
  getPaymentLinkForOrder,
} from '@/services/paymentServices'
import { ERROR_MESSAGES, HTTP_STATUS } from '@/lib/constants'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const validatedData = orderSchema.parse(body)

    const result = await prisma.$transaction(async tx => {
      let lead = await tx.lead.findFirst({
        where: {
          OR: [
            { email: validatedData.lead.email },
            { phoneNumber: validatedData.lead.phoneNumber },
          ],
        },
      })

      if (!lead) {
        lead = await tx.lead.create({
          data: {
            fullName: validatedData.lead.fullName,
            email: validatedData.lead.email,
            phoneNumber: validatedData.lead.phoneNumber,
            whatsappNumber: validatedData.lead.whatsappNumber,
          },
        })
      } else {
        lead = await tx.lead.update({
          where: { id: lead.id },
          data: {
            fullName: validatedData.lead.fullName,
            email: validatedData.lead.email || lead.email,
            phoneNumber: validatedData.lead.phoneNumber || lead.phoneNumber,
            whatsappNumber:
              validatedData.lead.whatsappNumber || lead.whatsappNumber,
          },
        })
      }

      let validatedDiscount = null
      if (validatedData.discountCode) {
        validatedDiscount = await tx.discountCode.findFirst({
          where: {
            code: validatedData.discountCode,
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
        })

        if (!validatedDiscount) {
          throw new Error('Invalid or expired discount code')
        }
      }

      let finalAmount = validatedData.totalCost
      let discountAmount = 0

      if (validatedDiscount) {
        if (validatedDiscount.type === 'PERCENTAGE') {
          discountAmount =
            (validatedData.totalCost *
              parseFloat(validatedDiscount.value.toString())) /
            100
        } else {
          discountAmount = parseFloat(validatedDiscount.value.toString())
        }
        finalAmount = Math.max(0, validatedData.totalCost - discountAmount)
      }

      const order = await tx.order.create({
        data: {
          serviceName: validatedData.serviceName,
          description: validatedData.description,
          requirements: validatedData.requirements,
          totalCost: validatedData.totalCost,
          finalAmount: finalAmount,
          discountAmount: discountAmount,
          estimatedDays: validatedData.estimatedDays,
          deadline: validatedData.deadline
            ? new Date(validatedData.deadline)
            : null,
          leadId: lead.id,
          discountCodeId: validatedDiscount?.id,
        },
        include: {
          lead: true,
          discountCode: true,
        },
      })

      // Update discount usage if applicable
      if (validatedDiscount) {
        await tx.discountCode.update({
          where: { id: validatedDiscount.id },
          data: { usedCount: { increment: 1 } },
        })
      }

      return order
    })

    // Create Notion entry
    try {
      await createNotionOrderEntry(result)

      // Also create lead entry if it's a new lead
      if (!result.lead.email || !result.lead.phoneNumber) {
        await createNotionLeadEntry(result.lead)
      }
    } catch (notionError) {
      console.error('Failed to create Notion entry:', notionError)
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
        console.warn('Payment link creation returned null or undefined')
      }
    } catch (error) {
      console.error('Failed to create payment link:', {
        orderId: result.id,
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      })

      return NextResponse.json(
        { success: false, error: ERROR_MESSAGES.PAYMENT.FAILED },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      )
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error creating order:', error)

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

    const where = status ? { status: status as OrderStatus } : {}

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
      orders: orders.map(order => ({
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
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
