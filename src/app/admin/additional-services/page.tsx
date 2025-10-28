import { Suspense } from 'react'
import { Preloader } from '@/components/ui/preloader'
import AdditionalServicesTable from '@/components/admin/AdditionalServicesTable'
import { prisma } from '@/lib/prisma'

export default async function AdditionalServicesPage() {
  const services = await prisma.additionalService.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Convert Decimal to number for client components
  const serializedServices = services.map(service => ({
    ...service,
    price:
      typeof service.price === 'object'
        ? parseFloat(service.price.toString())
        : service.price,
  }))

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Additional Services Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage additional services, pricing, and availability
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <Preloader variant="spinner" size="xl" text="Loading services..." />
          </div>
        }
      >
        <AdditionalServicesTable initialData={serializedServices} />
      </Suspense>
    </div>
  )
}
