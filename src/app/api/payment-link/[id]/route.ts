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
        paymentLink: `${createdPaymentLink.payment_url}?embedded=true&parent_origin=${process.env.NEXT_PUBLIC_APP_URL}&enable_postmessage=true`,
      })
    }
  } catch (error) {
    console.error('Failed to create payment link:', error)
  }
}
