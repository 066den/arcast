import { NextResponse } from 'next/server'
import { getPaymentLink } from '@/services/paymentServices'
import { BASE_URL } from '@/lib/constants'

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  try {
    const createdPaymentLink = await getPaymentLink(id)
    if (createdPaymentLink) {
      return NextResponse.json({
        paymentLink: `${createdPaymentLink.payment_url}?embedded=true&parent_origin=${BASE_URL}&enable_postmessage=true`,
      })
    }

    return NextResponse.json(
      { error: 'Payment link not found' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Failed to create payment link:', error)
    return NextResponse.json(
      { error: 'Failed to create payment link' },
      { status: 500 }
    )
  }
}
