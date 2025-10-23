import { Suspense } from 'react'
import { Preloader } from '@/components/ui/preloader'
import ServicesTable from '@/components/admin/ServicesTable'
import { fetchServices } from '@/services/serviceServices'

export default async function ServicesPage() {
  const services = await fetchServices()

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Services Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your services, pricing, and availability
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <Preloader variant="spinner" size="xl" text="Loading services..." />
          </div>
        }
      >
        <ServicesTable initialData={services} />
      </Suspense>
    </div>
  )
}
