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
import StaffForm from './StaffForm'
import { ConfirmModal } from '@/components/modals/modal'

interface Staff {
  id: string
  name: string
  role?: string | null
  imageUrl?: string | null
}

interface StaffTableProps {
  initialData: Staff[]
}

export default function StaffTable({ initialData }: StaffTableProps) {
  const [staff, setStaff] = useState<Staff[]>(initialData)
  const [showForm, setShowForm] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    staff: Staff | null
  }>({ isOpen: false, staff: null })
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSave = async (staffData: Staff, imageFile?: File | null) => {

    try {
      const url = editingStaff ? `/api/staff/${editingStaff.id}` : '/api/staff'

      const method = editingStaff ? 'PUT' : 'POST'

      const formData = new FormData()
      formData.append('name', staffData.name || '')
      formData.append('role', staffData.role || '')

      if (imageFile) {
        formData.append('imageFile', imageFile)
      }

      const response = await fetch(url, {
        method,
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to save staff')
      }

      const savedStaff = await response.json()

      if (editingStaff) {
        setStaff(prev =>
          prev.map(item => (item.id === editingStaff.id ? savedStaff : item))
        )
      } else {
        setStaff(prev => [...prev, savedStaff])
      }

      setShowForm(false)
      setEditingStaff(null)
    } catch (error) {
      
      throw error
    } finally {
    }
  }

  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff)
    setShowForm(true)
  }

  const handleDelete = (staff: Staff) => {
    setDeleteDialog({ isOpen: true, staff })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.staff) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/staff/${deleteDialog.staff.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete staff')
      }

      setStaff(prev => prev.filter(item => item.id !== deleteDialog.staff!.id))
      toast.success('Staff member deleted')
    } catch (error) {
      
      toast.error('Error deleting staff member')
    } finally {
      setIsDeleting(false)
      setDeleteDialog({ isOpen: false, staff: null })
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, staff: null })
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingStaff(null)
  }

  if (showForm) {
    return (
      <StaffForm
        staff={editingStaff || undefined}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Staff</CardTitle>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Staff Member
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {staff.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No staff members found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setShowForm(true)}
            >
              Add First Staff Member
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name || 'Staff'}
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
                      {item.role || 'No role specified'}
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
        title="Delete Staff Member"
        description={`Are you sure you want to delete "${deleteDialog.staff?.name || 'this staff member'}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={isDeleting}
      />
    </Card>
  )
}
