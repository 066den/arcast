import { Suspense } from 'react'
import { Preloader } from '@/components/ui/preloader'
import OrdersTable from '@/components/admin/OrdersTable'
import { prisma } from '@/lib/prisma'
import { OrderRow } from '@/types/admin'

async function fetchOrders() {
  const orders = await prisma.order.findMany({
    include: {
      lead: true,
      discountCode: true,
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

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
    totalCost: toNum(o.totalCost),
    finalAmount: o.finalAmount != null ? toNum(o.finalAmount) : null,
    discountAmount: o.discountAmount != null ? toNum(o.discountAmount) : null,
    payment: o.payment
      ? {
          ...o.payment,
          amount:
            (o.payment as { amount?: unknown }).amount != null
              ? toNum((o.payment as { amount?: unknown }).amount)
              : undefined,
        }
      : null,
  }))
}

export default async function OrdersPage() {
  const orders = await fetchOrders()

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground mt-2">
          Manage orders and update their status
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <Preloader variant="spinner" size="xl" text="Loading orders..." />
          </div>
        }
      >
        <OrdersTable initialData={orders as OrderRow[]} />
      </Suspense>
    </div>
  )
}
