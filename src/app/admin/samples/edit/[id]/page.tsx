import { Suspense } from 'react'
import { Preloader } from '@/components/ui/preloader'
import SampleEditForm from '@/components/admin/SampleEditForm'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

async function fetchSample(id: string) {
  try {
    const sample = await prisma.sample.findUnique({
      where: { id },
      include: {
        serviceType: true,
      },
    })

    return sample
  } catch (error) {
    console.error('Error fetching sample:', error)
    return null
  }
}

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

interface EditSamplePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditSamplePage({ params }: EditSamplePageProps) {
  const { id } = await params

  const [sample, serviceTypes] = await Promise.all([
    fetchSample(id),
    fetchServiceTypes(),
  ])

  if (!sample) {
    notFound()
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Sample</h1>
        <p className="text-muted-foreground mt-2">
          Update sample details and associations
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <Preloader variant="spinner" size="xl" text="Loading sample..." />
          </div>
        }
      >
        <SampleEditForm sample={sample} serviceTypes={serviceTypes} />
      </Suspense>
    </div>
  )
}
