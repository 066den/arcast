import { prisma } from '@/lib/prisma'
import {
  ERROR_MESSAGES,
  PAYMENT_PROVIDER,
  PAYMENT_STATUS,
} from '@/lib/constants'
import { Booking, Lead } from '@/types'
import { MamoPaymentLinkResponse } from '@/types/api'
import { formatDateDubai, formatTimeDubai } from '@/utils/dateFormat'
import { ApiError, apiRequest } from '@/lib/api'

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
    console.log('Getting payment link for booking:', bookingId)

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        lead: true,
        contentPackage: true,
      },
    })

    if (!booking) {
      console.error('Booking not found:', bookingId)
      throw new Error(ERROR_MESSAGES.BOOKING.NOT_FOUND)
    }

    console.log('Booking found:', {
      id: booking.id,
      totalCost: booking.totalCost,
      leadEmail: booking.lead?.email,
      hasContentPackage: !!booking.contentPackage,
    })

    const existingPayment = await prisma.payment.findUnique({
      where: { bookingId: booking.id },
    })

    if (existingPayment && existingPayment.status !== PAYMENT_STATUS.FAILED) {
      console.log('Payment already exists for booking:', {
        paymentId: existingPayment.id,
        status: existingPayment.status,
      })
      return {
        success: false,
        error: ERROR_MESSAGES.PAYMENT.ALREADY_EXISTS,
        payment: existingPayment,
      }
    }

    const createdPaymentLink = await createPaymentLink(
      booking as Booking,
      booking.lead
    )
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
        metadata: createdPaymentLink,
      },
    })

    console.log('Payment record created:', {
      paymentId: payment.id,
      externalId: payment.externalId,
    })

    return { payment, paymentLink: createdPaymentLink }
  } catch (error) {
    console.error('Error in getPaymentLinkForBooking:', {
      bookingId,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    })
    throw error
  }
}

const createPaymentLink = async (booking: Booking, lead: Lead) => {
  try {
    // Check payment service configuration
    const configCheck = checkPaymentServiceConfig()
    if (!configCheck.isValid) {
      console.error('Payment service configuration is invalid:', {
        missing: configCheck.missing,
        config: configCheck.config,
      })
      throw new Error(
        `Payment service configuration error: Missing ${configCheck.missing.join(', ')}`
      )
    }

    console.log('Creating payment link for booking:', {
      bookingId: booking.id,
      totalCost: booking.totalCost,
      currency: booking.contentPackage?.currency || PAYMENT_PROVIDER.CURRENCY,
      leadEmail: lead.email,
      leadName: lead.fullName,
    })

    const paymentData = {
      title: PAYMENT_PROVIDER.TITLE,
      description: `Studio booking for ${formatDateDubai(booking.startTime)} at ${formatTimeDubai(booking.startTime)}`,
      amount: Number(booking.totalCost),
      amount_currency:
        booking.contentPackage?.currency || PAYMENT_PROVIDER.CURRENCY,
      return_url: PAYMENT_PROVIDER.RETURN_URL,
      failure_return_url: PAYMENT_PROVIDER.FAILURE_RETURN_URL,
      link_type: 'inline',
      enable_customer_details: true,
      send_customer_receipt: true,
      external_id: booking.id,
      first_name: lead.fullName.split(' ')[0] || '',
      last_name: lead.fullName.split(' ').slice(1).join(' ') || '',
      email: lead.email,
      custom_data: {
        bookingId: booking.id,
        studio: booking.studioId,
        packageId: booking.contentPackageId,
      },
    }

    console.log('Payment data prepared:', {
      ...paymentData,
      // Don't log sensitive data
      amount: paymentData.amount,
      amount_currency: paymentData.amount_currency,
      external_id: paymentData.external_id,
    })

    const apiUrl = `${process.env.MAMO_BASE_URL}/links`
    console.log('Making request to MAMO API:', apiUrl)

    const paymentLink = await apiRequest<MamoPaymentLinkResponse>(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MAMO_API_KEY}`,
      },
      body: JSON.stringify(paymentData),
    })

    console.log('Payment link created successfully:', {
      paymentLinkId: paymentLink.id,
      paymentUrl: paymentLink.payment_url,
    })

    return paymentLink
  } catch (error) {
    console.error('Error creating payment link:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      bookingId: booking.id,
      leadEmail: lead.email,
    })

    if (error instanceof ApiError) {
      console.error('API Error details:', {
        statusCode: error.statusCode,
        code: error.code,
        message: error.message,
      })
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
