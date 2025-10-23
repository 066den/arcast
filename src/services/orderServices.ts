import { prisma } from '@/lib/prisma'

export async function fetchOrders() {
  const orders = await prisma.order.findMany({
    include: {
      lead: true,
      discountCode: true,
      payment: true,
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

  return orders.map(o => ({
    ...o,
    totalCost: toNum(o.totalCost) as number,
    finalAmount:
      o.finalAmount != null ? (toNum(o.finalAmount) as number) : null,
    discountAmount:
      o.discountAmount != null ? (toNum(o.discountAmount) as number) : null,
    payment: o.payment
      ? {
          ...o.payment,
          amount:
            (o.payment as { amount?: unknown }).amount != null
              ? (toNum((o.payment as { amount?: unknown }).amount) as number)
              : undefined,
        }
      : null,
  }))
}
