import { Suspense } from 'react'
import StaffTable from '@/components/admin/StaffTable'
import { Preloader } from '@/components/ui/preloader'
import { fetchStaff } from '@/services/staffServices'

interface Staff {
  id: string
  name: string
  role?: string | null
  imageUrl?: string | null
}

export default async function StaffPage() {
  const staff = await fetchStaff()

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Staff Management</h1>
        <p className="text-muted-foreground mt-2">
          Add and edit staff members for case studies
        </p>
      </div>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <Preloader variant="spinner" size="xl" text="Loading..." />
          </div>
        }
      >
        <StaffTable initialData={staff as Staff[]} />
      </Suspense>
    </div>
  )
}
