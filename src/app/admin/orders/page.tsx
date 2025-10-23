import { Suspense } from 'react'
import { Preloader } from '@/components/ui/preloader'
import OrdersTable from '@/components/admin/OrdersTable'
import { fetchOrders } from '@/services/orderServices'
import { OrderRow } from '@/types/admin'

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
        <OrdersTable initialData={orders} />
      </Suspense>
    </div>
  )
}
