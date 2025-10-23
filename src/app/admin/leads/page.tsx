import { Suspense } from 'react'
import { Preloader } from '@/components/ui/preloader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import LeadsTable from '@/components/admin/LeadsTable'
import CallRequestsTable from '@/components/admin/CallRequestsTable'
import { fetchLeads, fetchCallRequests } from '@/services/leadServices'

export default async function LeadsPage() {
  const [leads, callRequests] = await Promise.all([
    fetchLeads(),
    fetchCallRequests(),
  ])

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Leads</h1>
        <p className="text-muted-foreground mt-2">
          Manage leads and call requests
        </p>
      </div>

      <Tabs defaultValue="leads" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="leads">Leads ({leads.length})</TabsTrigger>
          <TabsTrigger value="call-requests">
            Call Requests ({callRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="mt-6">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-64">
                <Preloader
                  variant="spinner"
                  size="xl"
                  text="Loading leads..."
                />
              </div>
            }
          >
            <LeadsTable initialData={leads} />
          </Suspense>
        </TabsContent>

        <TabsContent value="call-requests" className="mt-6">
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
