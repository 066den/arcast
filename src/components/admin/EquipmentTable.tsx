'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { Edit, Trash2, Plus, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import EquipmentForm from './EquipmentForm'
import { ConfirmModal } from '@/components/modals/modal'

interface Equipment {
  id: string
  name: string
  description?: string | null
  imageUrl?: string | null
}

interface EquipmentTableProps {
  initialData: Equipment[]
}

export default function EquipmentTable({ initialData }: EquipmentTableProps) {
  const [equipment, setEquipment] = useState<Equipment[]>(initialData)
  const [showForm, setShowForm] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(
    null
  )
  const [, setIsLoading] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    equipment: Equipment | null
  }>({ isOpen: false, equipment: null })
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSave = async (
    equipmentData: Equipment,
    imageFile?: File | null
  ) => {
    setIsLoading(true)

    try {
      const url = editingEquipment
        ? `/api/equipment/${editingEquipment.id}`
        : '/api/equipment'

      const method = editingEquipment ? 'PUT' : 'POST'

      const formData = new FormData()
      formData.append('name', equipmentData.name || '')
      formData.append('description', equipmentData.description || '')

      if (imageFile) {
        formData.append('imageFile', imageFile)
      }

      const response = await fetch(url, {
        method,
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Server error response:', errorText)
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(
            errorData.error || errorData.details || 'Failed to save equipment'
          )
        } catch {
          throw new Error('Failed to save equipment')
        }
      }

      const savedEquipment = await response.json()

      if (editingEquipment) {
        setEquipment(prev =>
          prev.map(item =>
            item.id === editingEquipment.id ? savedEquipment : item
          )
        )
      } else {
        setEquipment(prev => [...prev, savedEquipment])
      }

      setShowForm(false)
      setEditingEquipment(null)
    } catch (error) {
      console.error('Save error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (equipment: Equipment) => {
    setEditingEquipment(equipment)
    setShowForm(true)
  }

  const handleDelete = (equipment: Equipment) => {
    setDeleteDialog({ isOpen: true, equipment })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.equipment) return

    setIsDeleting(true)
    try {
      const response = await fetch(
        `/api/equipment/${deleteDialog.equipment.id}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete equipment')
      }

      setEquipment(prev =>
        prev.filter(item => item.id !== deleteDialog.equipment!.id)
      )
      toast.success('Equipment deleted')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Error deleting equipment')
    } finally {
      setIsDeleting(false)
      setDeleteDialog({ isOpen: false, equipment: null })
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, equipment: null })
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingEquipment(null)
  }

  if (showForm) {
    return (
      <EquipmentForm
        equipment={editingEquipment || undefined}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Equipment</CardTitle>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Equipment
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {equipment.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No equipment found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setShowForm(true)}
            >
              Add First Equipment
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipment.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name || 'Equipment'}
                        width={48}
                        height={48}
                        className="object-cover rounded"
                        loader={({ src }) => src}
                        unoptimized
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{item.name || 'Untitled'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate text-muted-foreground">
                      {item.description || 'No description'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(item)}
                        className="text-red-600 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <ConfirmModal
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Equipment"
        description={`Are you sure you want to delete "${deleteDialog.equipment?.name || 'this equipment'}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={isDeleting}
      />
    </Card>
  )
}
