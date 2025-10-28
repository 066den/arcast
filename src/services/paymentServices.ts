import { prisma } from '@/lib/prisma'
import {
  ERROR_MESSAGES,
  PAYMENT_PROVIDER,
  PAYMENT_STATUS,
} from '@/lib/constants'
import { Lead } from '@/types'
import { MamoPaymentLinkResponse } from '@/types/api'
import { formatDateDubai, formatTimeDubai } from '@/utils/dateFormat'
import { ApiError, apiRequest } from '@/lib/api'
import { Decimal } from '@prisma/client/runtime/library'

// Utility function to check payment service configuration
export const checkPaymentServiceConfig = () => {
  const config = {
    mamoBaseUrl: process.env.MAMO_BASE_URL,
    mamoApiKey: process.env.MAMO_API_KEY,
    nextPublicAppUrl: process.env.NEXT_PUBLIC_APP_URL,
  }

  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key)

  return {
    isValid: missing.length === 0,
    missing,
    config: {
      ...config,
      // Don't expose API key in logs
      mamoApiKey: config.mamoApiKey ? '***' : undefined,
    },
  }
}

export const getPaymentLinkForBooking = async (bookingId: string) => {
  if (!prisma) {
    throw new Error(ERROR_MESSAGES.PRISMA.NOT_INITIALIZED)
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        lead: true,
        contentPackage: true,
      },
    })

    if (!booking) {
      
      throw new Error(ERROR_MESSAGES.BOOKING.NOT_FOUND)
    }

    const existingPayment = await prisma.payment.findUnique({
      where: { bookingId: booking.id },
    })

    if (existingPayment && existingPayment.status !== PAYMENT_STATUS.FAILED) {
      return {
        success: false,
        error: ERROR_MESSAGES.PAYMENT.ALREADY_EXISTS,
        payment: existingPayment,
      }
    }

    const createdPaymentLink = await createPaymentLink({
      id: booking.id,
      totalCost: booking.totalCost,
      currency: booking.contentPackage?.currency || 'AED',
      startTime: booking.startTime,
      lead: booking.lead,
      isBooking: true,
    })

    if (!createdPaymentLink) {
      throw new Error('Failed to create payment link')
    }

    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.totalCost,
        currency: booking.contentPackage?.currency || 'AED',
        status: PAYMENT_STATUS.PENDING,
        provider: 'MAMO_PAY',
        externalId: createdPaymentLink.id,
        metadata: JSON.parse(JSON.stringify(createdPaymentLink)),
      },
    })

    

    return { payment, paymentLink: createdPaymentLink }
  } catch (error) {
    
    throw error
  }
}

export const getPaymentLinkForOrder = async (orderId: string) => {
  if (!prisma) {
    throw new Error(ERROR_MESSAGES.PRISMA.NOT_INITIALIZED)
  }

  try {
    

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        lead: true,
      },
    })

    if (!order) {
      
      throw new Error(ERROR_MESSAGES.ORDER.NOT_FOUND)
    }

    

    const existingPayment = await prisma.orderPayment.findUnique({
      where: { orderId: order.id },
    })

    if (existingPayment && existingPayment.status !== PAYMENT_STATUS.FAILED) {
      return {
        success: false,
        error: ERROR_MESSAGES.PAYMENT.ALREADY_EXISTS,
        payment: existingPayment,
      }
    }

    const createdPaymentLink = await createPaymentLink({
      id: order.id,
      totalCost: order.totalCost,
      currency: 'AED',
      lead: order.lead,
      isBooking: false,
    })
    if (!createdPaymentLink) {
      throw new Error('Failed to create payment link')
    }

    const payment = await prisma.orderPayment.create({
      data: {
        orderId: order.id,
        amount: order.totalCost,
        currency: 'AED',
        status: PAYMENT_STATUS.PENDING,
        provider: 'MAMO_PAY',
        externalId: createdPaymentLink.id,
        metadata: JSON.parse(JSON.stringify(createdPaymentLink)),
      },
    })

    return { payment, paymentLink: createdPaymentLink }
  } catch (error) {
    
    throw error
  }
}

const createPaymentLink = async ({
  id,
  totalCost,
  currency,
  startTime,
  serviceName,
  lead,
  isBooking = true,
}: {
  id: string
  totalCost: number | Decimal
  currency: string
  startTime?: Date
  serviceName?: string
  lead: Lead
  isBooking: boolean
}) => {
  try {
    // Check payment service configuration
    const configCheck = checkPaymentServiceConfig()
    if (!configCheck.isValid) {
      
      throw new Error(
        `Payment service configuration error: Missing ${configCheck.missing.join(', ')}`
      )
    }

    const description = isBooking
      ? `Studio booking for ${startTime && formatDateDubai(startTime)} at ${startTime && formatTimeDubai(startTime)}`
      : `Order for ${serviceName}`

    const paymentData = {
      title: PAYMENT_PROVIDER.TITLE,
      description,
      amount: Number(totalCost),
      amount_currency: currency || PAYMENT_PROVIDER.CURRENCY,
      return_url: PAYMENT_PROVIDER.RETURN_URL,
      failure_return_url: PAYMENT_PROVIDER.FAILURE_RETURN_URL,
      link_type: 'inline',
      enable_customer_details: true,
      send_customer_receipt: true,
      external_id: id,
      first_name: lead.fullName.split(' ')[0] || '',
      last_name: lead.fullName.split(' ').slice(1).join(' ') || '',
      email: lead.email,
    }

    const apiUrl = `${process.env.MAMO_BASE_URL}/links`

    const paymentLink = await apiRequest<MamoPaymentLinkResponse>(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MAMO_API_KEY}`,
      },
      body: JSON.stringify(paymentData),
    })

    return paymentLink
  } catch (error) {
    

    if (error instanceof ApiError) {
      
      throw new Error(`Failed to create payment link: ${error.message}`)
    }
    throw new Error('Failed to create payment link')
  }
}

export const getPaymentLink = async (paymentLinkId: string) => {
  const paymentLink = await apiRequest<MamoPaymentLinkResponse>(
    `${process.env.MAMO_BASE_URL}/links/${paymentLinkId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MAMO_API_KEY}`,
      },
    }
  )
  return paymentLink
}
