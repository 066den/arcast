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
import { Edit, Trash2, Plus, Package } from 'lucide-react'
import ServiceForm from './ServiceForm'
import { ConfirmModal } from '@/components/modals/modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Service } from '@/types'

interface ServicesTableProps {
  initialData: Service[]
}

export default function ServicesTable({ initialData }: ServicesTableProps) {
  const [services, setServices] = useState<Service[]>(initialData)

  // Group services by type for better display
  const groupedServices = services.reduce(
    (acc, service) => {
      const typeName = service.serviceType?.name
      if (!typeName) {
        return acc
      }
      if (!acc[typeName]) {
        acc[typeName] = []
      }
      acc[typeName].push(service)
      return acc
    },
    {} as Record<string, Service[]>
  )

  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState<Service | undefined>(
    undefined
  )
  const [isLoading, setIsLoading] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    service: Service | null
  }>({ isOpen: false, service: null })
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSave = async (
    serviceData: {
      name: string
      description?: string
      serviceTypeId: string
      price: string
      currency: string
      isPopular: boolean
      isActive: boolean
      sortOrder?: string
    },
    includes?: string[]
  ) => {
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('name', serviceData.name)
      formData.append('description', serviceData.description || '')
      formData.append('includes', JSON.stringify(includes || []))
      formData.append('serviceTypeId', serviceData.serviceTypeId)
      formData.append('price', serviceData.price)
      formData.append('currency', serviceData.currency)
      formData.append('isPopular', serviceData.isPopular.toString())
      formData.append('isActive', serviceData.isActive.toString())
      formData.append('sortOrder', serviceData.sortOrder || '0')

      const url = editingService
        ? `/api/admin/services/${editingService.id}`
        : '/api/admin/services'
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
          prev.map(item =>
            item.id === editingService.id ? savedService : item
          )
        )
        toast.success('Service updated successfully')
      } else {
        setServices(prev => [...prev, savedService])
        toast.success('Service created successfully')
      }

      setShowForm(false)
      setEditingService(undefined)
    } catch (error) {
      
      toast.error('Error saving service')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setShowForm(true)
  }

  const handleDelete = (service: Service) => {
    setDeleteDialog({ isOpen: true, service })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.service) return

    setIsDeleting(true)
    try {
      const response = await fetch(
        `/api/admin/services/${deleteDialog.service.id}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete service')
      }

      setServices(prev =>
        prev.filter(item => item.id !== deleteDialog.service!.id)
      )
      toast.success('Service deleted')
    } catch (error) {
      
      toast.error('Error deleting service')
    } finally {
      setIsDeleting(false)
      setDeleteDialog({ isOpen: false, service: null })
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, service: null })
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingService(undefined)
  }

  const handleCreate = () => {
    setEditingService(undefined)
    setShowForm(true)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Services Management</CardTitle>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Service
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm ? (
          <ServiceForm
            service={editingService}
            onSave={handleSave}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Sort Order</TableHead>
                <TableHead>Includes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(groupedServices).map(
                ([typeName, typeServices]) => (
                  <React.Fragment key={typeName}>
                    {/* Service Type Header */}
                    <TableRow className="bg-gray-50">
                      <TableCell
                        colSpan={6}
                        className="font-semibold text-gray-700 py-3"
                      >
                        <div className="flex items-center text-xl gap-2">
                          <div className="w-6 h-6 rounded flex items-center justify-center">
                            <Package className="size-5" />
                          </div>
                          {typeName}
                          <Badge variant="secondary" className="ml-2">
                            {typeServices.length} service
                            {typeServices.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                    {/* Services in this type */}
                    {typeServices.map(service => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">
                          <div>{service.name}</div>
                          {service.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {service.description}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {service.currency} {service.price}
                        </TableCell>
                        <TableCell>
                          {service.sortOrder ?? 0}
                        </TableCell>
                        <TableCell>
                          {service.includes.length > 0 ? (
                            <div className="max-w-xs space-y-1">
                              {service.includes
                                .slice(0, 2)
                                .map((item, index) => (
                                  <div
                                    key={index}
                                    className="text-xs whitespace-break-spaces bg-gray-100 px-2 py-1 rounded"
                                  >
                                    {item}
                                  </div>
                                ))}
                              {service.includes.length > 2 && (
                                <div className="text-xs text-gray-500">
                                  +{service.includes.length - 2} more
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">
                              No includes
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {service.isPopular && (
                              <Badge variant="destructive" className="text-xs">
                                Popular
                              </Badge>
                            )}
                            <Badge
                              variant={
                                service.isActive ? 'default' : 'secondary'
                              }
                            >
                              {service.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(service)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(service)}
                              className="text-red-600 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                )
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <ConfirmModal
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Service"
        description={`Are you sure you want to delete "${deleteDialog.service?.name || 'this service'}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={isDeleting}
      />
    </Card>
  )
}
