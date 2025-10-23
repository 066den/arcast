import { NextResponse } from 'next/server'
import { checkPaymentServiceConfig } from '@/services/paymentServices'

export async function GET() {
  try {
    const configCheck = checkPaymentServiceConfig()

    return NextResponse.json({
      success: true,
      paymentService: {
        configured: configCheck.isValid,
        missing: configCheck.missing,
        config: configCheck.config,
      },
    })
  } catch (error) {
    console.error('Error checking payment service health:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check payment service configuration',
        paymentService: {
          configured: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    )
  }
}
