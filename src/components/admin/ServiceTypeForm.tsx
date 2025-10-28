'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ServiceType } from '@/types'

interface ServiceTypeFormProps {
  serviceType?: ServiceType
  onSave: (data: {
    name: string
    description?: string
    slug: string
    sortOrder: number
    isActive: boolean
  }) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function ServiceTypeForm({
  serviceType,
  onSave,
  onCancel,
  isLoading = false,
}: ServiceTypeFormProps) {
  const [name, setName] = useState(serviceType?.name || '')
  const [description, setDescription] = useState(serviceType?.description || '')
  const [slug, setSlug] = useState(serviceType?.slug || '')
  const [sortOrder, setSortOrder] = useState(serviceType?.sortOrder ?? 0)
  const [isActive, setIsActive] = useState(serviceType?.isActive ?? true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name,
      description,
      slug,
      sortOrder: Number(sortOrder),
      isActive,
    })
  }

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (value: string) => {
    setName(value)
    if (!serviceType) {
      // Auto-generate slug when creating new
      setSlug(generateSlug(value))
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            {serviceType ? 'Edit Service Type' : 'Create Service Type'}
          </CardTitle>
          <CardDescription>
            {serviceType
              ? 'Update service type information'
              : 'Add a new service type to categorize your services'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label size="lg" htmlFor="name">
              Name *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="e.g., Podcast Recording"
              required
            />
          </div>

          <div className="space-y-2">
            <Label size="lg" htmlFor="slug">
              Slug *
            </Label>
            <Input
              id="slug"
              value={slug}
              onChange={e => setSlug(e.target.value)}
              placeholder="e.g., podcast-recording"
              required
            />
            <p className="text-xs text-gray-500">
              URL-friendly identifier (e.g., podcast-recording)
            </p>
          </div>

          <div className="space-y-2">
            <Label size="lg" htmlFor="description">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of this service type..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label size="lg" htmlFor="sortOrder">
              Sort Order
            </Label>
            <Input
              id="sortOrder"
              type="number"
              value={sortOrder}
              onChange={e => setSortOrder(Number(e.target.value))}
              placeholder="0"
              min="0"
            />
            <p className="text-xs text-gray-500">
              Lower numbers appear first in listings
            </p>
          </div>

          <div className="flex items-center justify-between space-x-2 rounded-md border p-4">
            <div className="space-y-0.5">
              <Label size="lg" htmlFor="isActive">
                Active
              </Label>
              <p className="text-xs text-gray-500">
                Only active service types are shown in the system
              </p>
            </div>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? 'Saving...'
              : serviceType
                ? 'Update Service Type'
                : 'Create Service Type'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
