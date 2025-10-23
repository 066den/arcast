import { prisma } from '@/lib/prisma'

export async function fetchLeads() {
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

  // Convert Decimal values to numbers for client components
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

  return leads.map(lead => ({
    ...lead,
    bookings: lead.bookings.map(booking => ({
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
    orders: lead.orders.map(order => ({
      ...order,
      totalCost: toNum(order.totalCost),
      vatAmount: order.vatAmount != null ? toNum(order.vatAmount) : null,
      discountAmount:
        order.discountAmount != null ? toNum(order.discountAmount) : null,
      finalAmount: order.finalAmount != null ? toNum(order.finalAmount) : null,
    })),
  }))
}

export async function fetchCallRequests() {
  const callRequests = await prisma.callRequest.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return callRequests
}
