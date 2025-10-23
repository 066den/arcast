import { Suspense } from 'react'
import EquipmentTable from '@/components/admin/EquipmentTable'
import { Preloader } from '@/components/ui/preloader'
import { fetchEquipment } from '@/services/equipmentServices'

interface Equipment {
  id: string
  name: string
  description?: string | null
  imageUrl?: string | null
}

export default async function EquipmentPage() {
  const equipment = await fetchEquipment()

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Equipment Management</h1>
        <p className="text-muted-foreground mt-2">
          Add and edit equipment for case studies
        </p>
      </div>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <Preloader variant="spinner" size="xl" text="Loading..." />
          </div>
        }
      >
        <EquipmentTable initialData={equipment as Equipment[]} />
      </Suspense>
    </div>
  )
}
