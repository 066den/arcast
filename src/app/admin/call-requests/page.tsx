import { Suspense } from 'react'
import { Preloader } from '@/components/ui/preloader'
import CallRequestsTable from '@/components/admin/CallRequestsTable'
import { fetchCallRequests } from '@/services/leadServices'

export default async function CallRequestsPage() {
  const callRequests = await fetchCallRequests()

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Call Requests</h1>
        <p className="text-muted-foreground mt-2">
          Manage call requests from customers
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <Preloader
              variant="spinner"
              size="xl"
              text="Loading call requests..."
            />
          </div>
        }
      >
        <CallRequestsTable initialData={callRequests} />
      </Suspense>
    </div>
  )
}
