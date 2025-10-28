import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { BOOKING_STATUS, ORDER_STATUS, PAYMENT_STATUS } from '@/lib/constants'
import crypto from 'crypto'

/**
 * MamoPay Webhook Handler
 *
 * Event types (event_type):
 * - charge.succeeded: Successful one-off payment
 * - charge.failed: Failed one-off payment
 * - charge.authorized: Charge placed on hold
 * - charge.card_verified: Card verification payment
 * - charge.refund_initiated: Refund initialization
 * - charge.refunded: Successful refund
 * - charge.refund_failed: Failed refund
 * - subscription.succeeded: Successful subscription payment
 * - subscription.failed: Failed subscription payment
 * - payment_link.create: Payment link created
 * - payout.processed: Settled payout
 * - payout.failed: Rejected payout
 */

interface MamoWebhookPayload {
  event_type:
    | 'charge.succeeded'
    | 'charge.failed'
    | 'charge.authorized'
    | 'charge.card_verified'
    | 'charge.refund_initiated'
    | 'charge.refunded'
    | 'charge.refund_failed'
    | 'subscription.succeeded'
    | 'subscription.failed'
    | 'payment_link.create'
    | 'payout.processed'
    | 'payout.failed'
  data: {
    id: string // Payment link ID
    external_id?: string // Booking or Order ID
    status: string
    amount: number
    amount_currency: string
    payment_method?: string
    created_date?: string
    updated_date?: string
    customer?: {
      email?: string
      first_name?: string
      last_name?: string
    }
  }
}

// Verify webhook signature (если MamoPay предоставляет)
function verifyWebhookSignature(
  payload: string,
  signature: string | null
): boolean {
  if (!process.env.MAMO_WEBHOOK_SECRET) {
    
    return true
  }

  if (!signature) {
    return false
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.MAMO_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

export async function POST(req: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await req.text()
    const signature = req.headers.get('x-mamo-signature')

    // Verify signature
    if (!verifyWebhookSignature(rawBody, signature)) {
      
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload: MamoWebhookPayload = JSON.parse(rawBody)

    

    const { event_type, data } = payload
    const externalId = data.external_id

    if (!externalId) {
      
      return NextResponse.json(
        { error: 'Missing external_id' },
        { status: 400 }
      )
    }

    // Проверяем, это booking или order
    const booking = await prisma.booking.findUnique({
      where: { id: externalId },
      include: { payment: true },
    })

    const order = await prisma.order.findUnique({
      where: { id: externalId },
      include: { payment: true },
    })

    if (!booking && !order) {
      
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    // Event processing
    switch (event_type) {
      case 'charge.succeeded': {
        // Successful payment
        if (booking) {
          await prisma.booking.update({
            where: { id: booking.id },
            data: { status: BOOKING_STATUS.CONFIRMED },
          })

          if (booking.payment) {
            await prisma.payment.update({
              where: { id: booking.payment.id },
              data: {
                status: PAYMENT_STATUS.COMPLETED,
                completedAt: new Date(),
                metadata: data,
              },
            })
          }
        }

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: ORDER_STATUS.CONFIRMED },
          })

          if (order.payment) {
            await prisma.orderPayment.update({
              where: { id: order.payment.id },
              data: {
                status: PAYMENT_STATUS.COMPLETED,
                completedAt: new Date(),
                metadata: data,
              },
            })
          }
        }

        
        break
      }

      case 'charge.failed':
      case 'subscription.failed': {
        // Payment failed
        if (booking?.payment) {
          await prisma.payment.update({
            where: { id: booking.payment.id },
            data: {
              status: PAYMENT_STATUS.FAILED,
              metadata: data,
            },
          })

          await prisma.booking.update({
            where: { id: booking.id },
            data: { status: BOOKING_STATUS.CANCELLED },
          })
        }

        if (order?.payment) {
          await prisma.orderPayment.update({
            where: { id: order.payment.id },
            data: {
              status: PAYMENT_STATUS.FAILED,
              metadata: data,
            },
          })

          await prisma.order.update({
            where: { id: order.id },
            data: { status: ORDER_STATUS.CANCELLED },
          })
        }

        
        break
      }

      case 'charge.authorized': {
        // Payment authorized (on hold)
        if (booking?.payment) {
          await prisma.payment.update({
            where: { id: booking.payment.id },
            data: {
              status: PAYMENT_STATUS.PENDING,
              metadata: data,
            },
          })
        }

        if (order?.payment) {
          await prisma.orderPayment.update({
            where: { id: order.payment.id },
            data: {
              status: PAYMENT_STATUS.PENDING,
              metadata: data,
            },
          })
        }

        
        break
      }

      case 'charge.refunded': {
        // Refund successful
        if (booking?.payment) {
          await prisma.payment.update({
            where: { id: booking.payment.id },
            data: {
              status: PAYMENT_STATUS.REFUNDED,
              refundedAt: new Date(),
              metadata: data,
            },
          })

          await prisma.booking.update({
            where: { id: booking.id },
            data: { status: BOOKING_STATUS.CANCELLED },
          })
        }

        if (order?.payment) {
          await prisma.orderPayment.update({
            where: { id: order.payment.id },
            data: {
              status: PAYMENT_STATUS.REFUNDED,
              refundedAt: new Date(),
              metadata: data,
            },
          })

          await prisma.order.update({
            where: { id: order.id },
            data: { status: ORDER_STATUS.CANCELLED },
          })
        }

        
        break
      }

      case 'charge.refund_initiated': {
        // Refund initiated (pending)
        
        // Optionally update payment metadata to track refund status
        if (booking?.payment) {
          await prisma.payment.update({
            where: { id: booking.payment.id },
            data: { metadata: data },
          })
        }

        if (order?.payment) {
          await prisma.orderPayment.update({
            where: { id: order.payment.id },
            data: { metadata: data },
          })
        }
        break
      }

      case 'charge.refund_failed': {
        // Refund failed
        
        // Optionally notify admin or customer
        break
      }

      case 'subscription.succeeded': {
        // Subscription payment successful (if using subscriptions in future)
        
        break
      }

      case 'charge.card_verified':
      case 'payment_link.create':
      case 'payout.processed':
      case 'payout.failed': {
        // Informational events - just log
        
        break
      }

      default:
        
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// For webhook testing
export async function GET() {
  return NextResponse.json({
    message: 'MamoPay Webhook Endpoint',
    status: 'active',
    url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mamo`,
  })
}
