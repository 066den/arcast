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
import ServiceTypeForm from './ServiceTypeForm'
import { ConfirmModal } from '@/components/modals/modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ServiceType } from '@/types'

interface ServiceTypesTableProps {
  initialData: ServiceType[]
}

export default function ServiceTypesTable({
  initialData,
}: ServiceTypesTableProps) {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>(initialData)

  const [showForm, setShowForm] = useState(false)
  const [editingType, setEditingType] = useState<ServiceType | undefined>(
    undefined
  )
  const [isLoading, setIsLoading] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    type: ServiceType | null
  }>({ isOpen: false, type: null })
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSave = async (typeData: {
    name: string
    description?: string
    slug: string
    sortOrder: number
    isActive: boolean
  }) => {
    setIsLoading(true)

    try {
      const url = editingType
        ? `/api/admin/service-types/${editingType.id}`
        : '/api/admin/service-types'
      const method = editingType ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(typeData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save service type')
      }

      const savedType = await response.json()

      if (editingType) {
        setServiceTypes(prev =>
          prev.map(item => (item.id === editingType.id ? savedType : item))
        )
        toast.success('Service type updated successfully')
      } else {
        setServiceTypes(prev => [...prev, savedType])
        toast.success('Service type created successfully')
      }

      setShowForm(false)
      setEditingType(undefined)
    } catch (error) {
      console.error('Save error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Error saving service type'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (type: ServiceType) => {
    setEditingType(type)
    setShowForm(true)
  }

  const handleDelete = (type: ServiceType) => {
    setDeleteDialog({ isOpen: true, type })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.type) return

    setIsDeleting(true)
    try {
      const response = await fetch(
        `/api/admin/service-types/${deleteDialog.type.id}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete service type')
      }

      setServiceTypes(prev =>
        prev.filter(item => item.id !== deleteDialog.type!.id)
      )
      toast.success('Service type deleted')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Error deleting service type'
      )
    } finally {
      setIsDeleting(false)
      setDeleteDialog({ isOpen: false, type: null })
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, type: null })
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingType(undefined)
  }

  const handleCreate = () => {
    setEditingType(undefined)
    setShowForm(true)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Service Types Management</CardTitle>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Service Type
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm ? (
          <ServiceTypeForm
            serviceType={editingType}
            onSave={handleSave}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Sort Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No service types found. Create your first one!
                  </TableCell>
                </TableRow>
              ) : (
                serviceTypes.map(type => (
                  <TableRow key={type.id}>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell className="font-mono text-sm text-gray-600">
                      {type.slug}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {type.description || (
                        <span className="text-gray-400 text-sm">
                          No description
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{type.sortOrder}</TableCell>
                    <TableCell>
                      <Badge variant={type.isActive ? 'default' : 'secondary'}>
                        {type.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(type)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(type)}
                          className="text-red-600 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <ConfirmModal
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Service Type"
        description={`Are you sure you want to delete "${deleteDialog.type?.name || 'this service type'}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={isDeleting}
      />
    </Card>
  )
}
