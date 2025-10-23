import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  try {
    // Check if user is authenticated
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const leads = await prisma.lead.findMany({
      include: {
        bookings: {
          include: {
            studio: true,
            service: true,
            contentPackage: true,
          },
        },
        orders: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })

    // Convert Decimal values to numbers for JSON serialization
    const toNum = (v: unknown) => {
      if (
        v &&
        typeof v === 'object' &&
        typeof (v as { toString?: unknown }).toString === 'function'
      ) {
        const s = (v as { toString: () => string }).toString()
        const n = Number(s)
        return Number.isNaN(n) ? undefined : n
      }
      return v as unknown
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serializedLeads = leads.map((lead: any) => ({
      ...lead,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      bookings: lead.bookings.map((booking: any) => ({
        ...booking,
        totalCost: toNum(booking.totalCost),
        vatAmount: booking.vatAmount != null ? toNum(booking.vatAmount) : null,
        discountAmount:
          booking.discountAmount != null ? toNum(booking.discountAmount) : null,
        finalAmount:
          booking.finalAmount != null ? toNum(booking.finalAmount) : null,
        service: booking.service
          ? {
              ...booking.service,
              price: toNum(booking.service.price),
            }
          : null,
        contentPackage: booking.contentPackage
          ? {
              ...booking.contentPackage,
              basePrice: toNum(booking.contentPackage.basePrice),
            }
          : null,
      })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      orders: lead.orders.map((order: any) => ({
        ...order,
        totalCost: toNum(order.totalCost),
        vatAmount: order.vatAmount != null ? toNum(order.vatAmount) : null,
        discountAmount:
          order.discountAmount != null ? toNum(order.discountAmount) : null,
        finalAmount:
          order.finalAmount != null ? toNum(order.finalAmount) : null,
      })),
    }))

    return NextResponse.json({ leads: serializedLeads })
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}
