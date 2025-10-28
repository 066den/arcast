'use client'

import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Edit, Trash2, Plus } from 'lucide-react'
import AdditionalServiceForm from './AdditionalServiceForm'
import { ConfirmModal } from '@/components/modals/modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export interface AdditionalService {
  id: string
  name: string
  type: 'STANDARD' | 'BY_THREE'
  price: number
  currency: string
  count: number
  description: string | null
  imageUrls: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface AdditionalServicesTableProps {
  initialData: AdditionalService[]
}

export default function AdditionalServicesTable({
  initialData,
}: AdditionalServicesTableProps) {
  const [services, setServices] = useState<AdditionalService[]>(initialData)
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState<
    AdditionalService | undefined
  >(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    service: AdditionalService | null
  }>({ isOpen: false, service: null })
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSave = async (
    serviceData: {
      name: string
      type: string
      description?: string | null
      price: string
      currency: string
      count: string
      isActive: boolean
    },
    imageUrls?: string[]
  ) => {
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('name', serviceData.name)
      formData.append('type', serviceData.type)
      formData.append('description', serviceData.description || '')
      formData.append('price', serviceData.price)
      formData.append('currency', serviceData.currency)
      formData.append('count', serviceData.count)
      formData.append('isActive', serviceData.isActive.toString())
      formData.append('imageUrls', JSON.stringify(imageUrls || []))

      const url = editingService
        ? `/api/admin/additional-services/${editingService.id}`
        : '/api/admin/additional-services'
      const method = editingService ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to save service')
      }

      const savedService = await response.json()

      if (editingService) {
        setServices(prev =>
          prev.map(item => {
            if (item.id === editingService.id) {
              const price =
                typeof savedService.price === 'number'
                  ? savedService.price
                  : parseFloat(savedService.price.toString())

              return {
                id: savedService.id,
                name: savedService.name,
                type: savedService.type,
                price,
                currency: savedService.currency,
                count: savedService.count,
                description: savedService.description,
                imageUrls: savedService.imageUrls || [],
                isActive: savedService.isActive,
                createdAt: item.createdAt, // Preserve original creation date to maintain order
                updatedAt: new Date(savedService.updatedAt),
              }
            }
            return item
          })
        )
        toast.success('Service updated successfully')
      } else {
        setServices(prev => [savedService, ...prev])
        toast.success('Service created successfully')
      }

      setShowForm(false)
      setEditingService(undefined)
    } catch {
      toast.error('Failed to save service')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (service: AdditionalService) => {
    setEditingService(service)
    setShowForm(true)
  }

  const handleDelete = async (service: AdditionalService) => {
    setIsDeleting(true)

    try {
      const response = await fetch(
        `/api/admin/additional-services/${service.id}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete service')
      }

      setServices(prev => prev.filter(item => item.id !== service.id))
      toast.success('Service deleted successfully')
      setDeleteDialog({ isOpen: false, service: null })
    } catch {
      toast.error('Failed to delete service')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingService(undefined)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Additional Services</CardTitle>
            <Button
              onClick={() => setShowForm(true)}
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Service
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No additional services found
                    </TableCell>
                  </TableRow>
                ) : (
                  services.map(service => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">
                        {service.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{service.type}</Badge>
                      </TableCell>
                      <TableCell>
                        {service.price} {service.currency}
                      </TableCell>
                      <TableCell>{service.count}</TableCell>
                      <TableCell>
                        <Badge
                          variant={service.isActive ? 'default' : 'secondary'}
                        >
                          {service.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(service)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setDeleteDialog({ isOpen: true, service })
                            }
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <AdditionalServiceForm
          service={editingService}
          onSave={handleSave}
          onCancel={handleCloseForm}
          isLoading={isLoading}
        />
      )}

      <ConfirmModal
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, service: null })}
        onConfirm={() => {
          if (deleteDialog.service) {
            handleDelete(deleteDialog.service)
          }
        }}
        title="Delete Service"
        description={`Are you sure you want to delete "${deleteDialog.service?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={isDeleting}
      />
    </>
  )
}
