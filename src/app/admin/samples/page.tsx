import { Suspense } from 'react'
import { Preloader } from '@/components/ui/preloader'
import SamplesTable from '@/components/admin/SamplesTable'
import { fetchSamples } from '@/services/sampleServices'

export default async function SamplesPage() {
  const samples = await fetchSamples()

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Samples Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your video samples and thumbnails
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <Preloader variant="spinner" size="xl" text="Loading samples..." />
          </div>
        }
      >
        <SamplesTable initialData={samples} />
      </Suspense>
    </div>
  )
}
