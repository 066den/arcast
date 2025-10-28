import { NextResponse } from 'next/server'
import { getPaymentLink } from '@/services/paymentServices'

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  try {
    const createdPaymentLink = await getPaymentLink(id)
    if (createdPaymentLink) {
      return NextResponse.json({
        success: true,
        paymentLink: `${createdPaymentLink.payment_url}?embedded=true&parent_origin=${process.env.NEXT_PUBLIC_APP_URL}&enable_postmessage=true`,
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Payment link not found',
        message: 'No payment link found for this booking',
        code: 'PAYMENT_LINK_NOT_FOUND',
      },
      { status: 404 }
    )
  } catch (error) {
    

    let statusCode = 500
    let errorMessage = 'Failed to create payment link'
    let errorCode = 'PAYMENT_LINK_ERROR'

    if (error instanceof Error) {
      if (error.message.includes('Booking not found')) {
        statusCode = 404
        errorMessage = 'Booking not found'
        errorCode = 'BOOKING_NOT_FOUND'
      } else if (error.message.includes('Payment service configuration')) {
        statusCode = 503
        errorMessage = 'Payment service is not properly configured'
        errorCode = 'PAYMENT_SERVICE_CONFIG_ERROR'
      } else if (error.message.includes('MAMO API')) {
        statusCode = 502
        errorMessage = 'Payment provider is currently unavailable'
        errorCode = 'PAYMENT_PROVIDER_ERROR'
      } else if (error.message.includes('Database')) {
        statusCode = 503
        errorMessage = 'Database connection error'
        errorCode = 'DATABASE_ERROR'
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        code: errorCode,
        details:
          process.env.NODE_ENV === 'development'
            ? error?.toString()
            : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    )
  }
}
