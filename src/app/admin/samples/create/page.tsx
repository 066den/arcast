import { Suspense } from 'react'
import { Preloader } from '@/components/ui/preloader'
import SampleCreateForm from '@/components/admin/SampleCreateForm'
import { prisma } from '@/lib/prisma'

async function fetchServiceTypes() {
  try {
    const serviceTypes = await prisma.serviceType.findMany({
      orderBy: {
        name: 'asc',
      },
    })
    return serviceTypes
  } catch (error) {
    console.error('Error fetching service types:', error)
    return []
  }
}

export default async function CreateSamplePage() {
  const serviceTypes = await fetchServiceTypes()

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create New Sample</h1>
        <p className="text-muted-foreground mt-2">
          Add a new video sample to your collection
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <Preloader variant="spinner" size="xl" text="Loading form..." />
          </div>
        }
      >
        <SampleCreateForm serviceTypes={serviceTypes} />
      </Suspense>
    </div>
  )
}
