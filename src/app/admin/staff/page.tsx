'use client'

import { useEffect, useState } from 'react'
import StaffTable from '@/components/admin/StaffTable'
import { toast } from 'sonner'
import { Preloader } from '@/components/ui/preloader'

interface Staff {
  id: string
  name?: string | null
  role?: string | null
  imageUrl?: string | null
}

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/staff')
      if (!response.ok) {
        throw new Error('Failed to fetch staff')
      }
      const data = await response.json()
      setStaff(data)
    } catch (error) {
      console.error('Error fetching staff:', error)
      toast.error('Error loading staff')
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
        <h1 className="text-3xl font-bold">Staff Management</h1>
        <p className="text-muted-foreground mt-2">
          Add and edit staff members for case studies
        </p>
      </div>
      <StaffTable initialData={staff} />
    </div>
  )
}
