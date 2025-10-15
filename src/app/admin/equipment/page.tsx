'use client'

import { useEffect, useState } from 'react'
import EquipmentTable from '@/components/admin/EquipmentTable'
import { toast } from 'sonner'
import { Preloader } from '@/components/ui/preloader'

interface Equipment {
  id: string
  name: string
  description?: string | null
  imageUrl?: string | null
}

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchEquipment()
  }, [])

  const fetchEquipment = async () => {
    try {
      const response = await fetch('/api/equipment')
      if (!response.ok) {
        throw new Error('Failed to fetch equipment')
      }
      const data = await response.json()
      setEquipment(data)
    } catch (error) {
      console.error('Error fetching equipment:', error)
      toast.error('Error loading equipment')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-64">
          <Preloader variant="spinner" size="xl" text="Loading..." />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Equipment Management</h1>
        <p className="text-muted-foreground mt-2">
          Add and edit equipment for case studies
        </p>
      </div>
      <EquipmentTable initialData={equipment} />
    </div>
  )
}
