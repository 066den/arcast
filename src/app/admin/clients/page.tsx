import { Suspense } from 'react'
import { Preloader } from '@/components/ui/preloader'
import ClientsTable from '@/components/admin/ClientsTable'
import { fetchClients } from '@/services/clientServices'
import type { ClientRow } from '@/types/admin'

export default async function ClientsPage() {
  const clients = await fetchClients()
  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Clients</h1>
        <p className="text-muted-foreground mt-2">
          Manage client profiles and featured flag
        </p>
      </div>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <Preloader variant="spinner" size="xl" text="Loading clients..." />
          </div>
        }
      >
        <ClientsTable initialData={clients as ClientRow[]} />
      </Suspense>
    </div>
  )
}
