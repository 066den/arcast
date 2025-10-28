'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Save, X } from 'lucide-react'
import type { AdditionalService } from './AdditionalServicesTable'

const additionalServiceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['STANDARD', 'BY_THREE']),
  description: z.string().optional(),
  price: z.string().min(1, 'Price is required'),
  currency: z.string().min(1, 'Currency is required'),
  count: z.string().min(1, 'Count is required'),
  isActive: z.boolean(),
})

type AdditionalServiceFormData = z.infer<typeof additionalServiceSchema>

interface AdditionalServiceFormProps {
  service?: AdditionalService
  onSave: (data: AdditionalServiceFormData, imageUrls?: string[]) => void
  onCancel: () => void
  isLoading?: boolean
}

const AdditionalServiceForm = ({
  service,
  onSave,
  onCancel,
  isLoading = false,
}: AdditionalServiceFormProps) => {
  const [imageUrls, setImageUrls] = useState<string[]>(service?.imageUrls || [])
  const [newImageUrl, setNewImageUrl] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AdditionalServiceFormData>({
    resolver: zodResolver(additionalServiceSchema),
    defaultValues: {
      name: service?.name || '',
      type: service?.type || 'STANDARD',
      description: service?.description || '',
      price: service?.price ? String(service.price) : '',
      currency: service?.currency || 'AED',
      count: service?.count?.toString() || '1',
      isActive: service?.isActive ?? true,
    },
  })

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setImageUrls(prev => [...prev, newImageUrl.trim()])
      setNewImageUrl('')
    }
  }

  const handleRemoveImageUrl = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleFormSubmit = (data: AdditionalServiceFormData) => {
    onSave(data, imageUrls)
  }

  const type = watch('type')
  const isActive = watch('isActive')

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>
            {service ? 'Edit' : 'Create'} Additional Service
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label size="lg" htmlFor="name">
                Name *
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="e.g., Short Form Edit"
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label size="lg" htmlFor="type">
                Type *
              </Label>
              <Select
                value={type}
                onValueChange={value =>
                  setValue('type', value as 'STANDARD' | 'BY_THREE')
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STANDARD">Standard</SelectItem>
                  <SelectItem value="BY_THREE">By Three</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive">
                  {errors.type.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label size="lg" htmlFor="description">
                Description
              </Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Brief description of the service"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label size="lg" htmlFor="price">
                  Price *
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register('price')}
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="text-sm text-destructive">
                    {errors.price.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label size="lg" htmlFor="currency">
                  Currency *
                </Label>
                <Input
                  id="currency"
                  {...register('currency')}
                  placeholder="AED"
                />
                {errors.currency && (
                  <p className="text-sm text-destructive">
                    {errors.currency.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label size="lg" htmlFor="count">
                  Count *
                </Label>
                <Input
                  id="count"
                  type="number"
                  {...register('count')}
                  placeholder="1"
                />
                {errors.count && (
                  <p className="text-sm text-destructive">
                    {errors.count.message}
                  </p>
                )}
              </div>
            </div>

            {/* <div className="space-y-2">
              <Label size="lg">Images</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newImageUrl}
                    onChange={e => setNewImageUrl(e.target.value)}
                    placeholder="Enter image URL"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddImageUrl()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddImageUrl}
                    size="icon"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {imageUrls.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {imageUrls.map((url, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-muted rounded"
                      >
                        <span className="flex-1 text-sm truncate">{url}</span>
                        <Button
                          type="button"
                          onClick={() => handleRemoveImageUrl(index)}
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div> */}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={isActive}
                onCheckedChange={checked =>
                  setValue('isActive', checked as boolean)
                }
              />
              <Label size="lg" htmlFor="isActive" className="cursor-pointer">
                Active
              </Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdditionalServiceForm
