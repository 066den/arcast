'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Save, X } from 'lucide-react'
import ImageEditable from '@/components/ui/ImageEditable'
import { ASPECT_RATIOS } from '@/lib/constants'

interface Staff {
  id: string
  name: string
  role?: string | null
  imageUrl?: string | null
}

interface StaffFormProps {
  staff?: Staff
  onSave: (staff: Staff, imageFile?: File | null) => void
  onCancel: () => void
}

export default function StaffForm({ staff, onSave, onCancel }: StaffFormProps) {
  const [formData, setFormData] = useState<Staff>({
    id: staff?.id || '',
    name: staff?.name || '',
    role: staff?.role || '',
    imageUrl: staff?.imageUrl || '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name?.trim()) {
      toast.error('Staff name is required')
      return
    }

    setIsLoading(true)

    try {
      await onSave(formData, imageFile)
      toast.success(staff ? 'Staff updated' : 'Staff created')
    } catch (error) {
      toast.error('Error saving staff')
      
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof Staff, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {staff ? 'Edit Staff Member' : 'Add Staff Member'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={e => handleChange('name', e.target.value)}
              placeholder="Enter staff member name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              value={formData.role || ''}
              onChange={e => handleChange('role', e.target.value)}
              placeholder="Enter staff role (e.g., Producer, Director)"
            />
          </div>

          <div className="space-y-2">
            <Label>Image</Label>
            <ImageEditable
              className="mt-4"
              size="small"
              alt="Staff Image"
              onUpload={setImageFile}
              aspectRatio={ASPECT_RATIOS.SQUARE}
              src={staff?.imageUrl || undefined}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
