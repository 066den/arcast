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

export const getPaymentLinkForBooking = async (bookingId: string) => {
  if (!prisma) {
    throw new Error(ERROR_MESSAGES.PRISMA.NOT_INITIALIZED)
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        lead: true,
        package: true,
      },
    })

    if (!booking) {
      throw new Error(ERROR_MESSAGES.BOOKING.NOT_FOUND)
    }

    const existingPayment = await prisma.payment.findUnique({
      where: { bookingId: booking.id },
      include: {
        paymentLink: true,
      },
    })

    if (
      existingPayment &&
      existingPayment.paymentLink &&
      existingPayment.status !== PAYMENT_STATUS.FAILED
    ) {
      return {
        success: false,
        error: ERROR_MESSAGES.PAYMENT.ALREADY_EXISTS,
        payment: existingPayment,
      }
    }

    const createdPaymentLink = await createPaymentLink(booking, booking.lead)
    if (!createdPaymentLink) {
      throw new Error('Failed to create payment link')
    }

    const paymentLink = await prisma.paymentLink.create({
      data: {
        url: createdPaymentLink.payment_url,
        externalId: createdPaymentLink.id,
        provider: 'MAMO_PAY',
        amount: booking.totalCost,
        currency: booking.package.currency || 'AED',
        title: createdPaymentLink.title,
        description: createdPaymentLink.description,
        metadata: createdPaymentLink,
      },
    })

    let payment
    if (existingPayment) {
      payment = await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: PAYMENT_STATUS.PENDING,
          paymentLinkId: paymentLink.id,
          metadata: createdPaymentLink,
        },
      })
    } else {
      payment = await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: booking.totalCost,
          currency: booking.package.currency || 'AED',
          status: PAYMENT_STATUS.PENDING,
          provider: 'MAMO_PAY',
          paymentLinkId: paymentLink.id,
          metadata: createdPaymentLink,
        },
      })
    }

    return { payment, paymentLink: createdPaymentLink }
  } catch (error) {
    console.error('Error creating payment link:', error)
  }
}

const createPaymentLink = async (booking: Booking, lead: Lead) => {
  try {
    const paymentData = {
      title: PAYMENT_PROVIDER.TITLE,
      description: `Studio booking for ${formatDateDubai(booking.startTime)} at ${formatTimeDubai(booking.startTime)}`,
      amount: Number(booking.totalCost),
      amount_currency: booking.package?.currency || PAYMENT_PROVIDER.CURRENCY,
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
        packageId: booking.packageId,
      },
    }

    const paymentLink = await apiRequest<MamoPaymentLinkResponse>(
      `${process.env.MAMO_BASE_URL}/links`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.MAMO_API_KEY}`,
        },
        body: JSON.stringify(paymentData),
      }
    )

    return paymentLink
  } catch (error) {
    console.error('Error creating payment link:', error)
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
