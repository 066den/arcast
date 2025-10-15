'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Save, X } from 'lucide-react'
import ImageEditable from '@/components/ui/ImageEditable'
import { ASPECT_RATIOS } from '@/lib/constants'

interface Equipment {
  id?: string
  name?: string | null
  description?: string | null
  imageUrl?: string | null
}

interface EquipmentFormProps {
  equipment?: Equipment
  onSave: (equipment: Equipment, imageFile?: File | null) => void
  onCancel: () => void
}

export default function EquipmentForm({
  equipment,
  onSave,
  onCancel,
}: EquipmentFormProps) {
  const [formData, setFormData] = useState<Equipment>({
    name: equipment?.name || '',
    description: equipment?.description || '',
    imageUrl: equipment?.imageUrl || '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name?.trim()) {
      toast.error('Equipment name is required')
      return
    }

    setIsLoading(true)

    try {
      await onSave(formData, imageFile)
      toast.success(equipment ? 'Equipment updated' : 'Equipment created')
    } catch (error) {
      toast.error('Error saving equipment')
      console.error('Save error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof Equipment, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{equipment ? 'Edit Equipment' : 'Add Equipment'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={e => handleChange('name', e.target.value)}
              placeholder="Enter equipment name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={e => handleChange('description', e.target.value)}
              placeholder="Enter equipment description"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Image</Label>
            <ImageEditable
              className="mt-4"
              size="small"
              alt="Equipment Image"
              onUpload={setImageFile}
              aspectRatio={ASPECT_RATIOS.SQUARE}
              src={equipment?.imageUrl || undefined}
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
