import { Suspense } from 'react'
import { Preloader } from '@/components/ui/preloader'
import ServiceTypesTable from '@/components/admin/ServiceTypesTable'
import { prisma } from '@/lib/prisma'

export default async function ServiceTypesPage() {
  const serviceTypes = await prisma.serviceType.findMany({
    orderBy: {
      sortOrder: 'asc',
    },
    include: {
      _count: {
        select: {
          services: true,
          samples: true,
        },
      },
    },
  })

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Service Types Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your service type categories and organization
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <Preloader
              variant="spinner"
              size="xl"
              text="Loading service types..."
            />
          </div>
        }
      >
        <ServiceTypesTable initialData={serviceTypes} />
      </Suspense>
    </div>
  )
}
