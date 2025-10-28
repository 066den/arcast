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
import { Edit, Trash2, Plus, Package as PackageIcon } from 'lucide-react'
import PackageForm from './PackageForm'
import { ConfirmModal } from '@/components/modals/modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Package {
  id: string
  name: string
  description: string | null
  basePrice: number
  currency: string
  isActive: boolean
  createdAt: string | Date
  updatedAt: string | Date
  servicePackageRecords?: ServicePackageRecord[]
  addServicePackageRecords?: AddServicePackageRecord[]
}

interface ServicePackageRecord {
  id: string
  includedService: {
    id: string
    name: string
  }
  serviceQuantity: number
}

interface AddServicePackageRecord {
  id: string
  includedAdditionalService: {
    id: string
    name: string
  }
  serviceQuantity: number
}

interface PackagesTableProps {
  initialData: Package[]
}

export default function PackagesTable({ initialData }: PackagesTableProps) {
  const [packages, setPackages] = useState<Package[]>(initialData)
  const [showForm, setShowForm] = useState(false)
  const [editingPackage, setEditingPackage] = useState<Package | undefined>(
    undefined
  )
  const [isLoading, setIsLoading] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    packageData: Package | null
  }>({ isOpen: false, packageData: null })
  const [isDeleting, setIsDeleting] = useState(false)

  const refreshPackages = async () => {
    try {
      const response = await fetch('/api/admin/packages')
      if (response.ok) {
        const data = await response.json()
        // Serialize packages for client component
        const serializedPackages = data.map((pkg: any) => ({
          ...pkg,
          basePrice: Number(pkg.basePrice),
          createdAt: new Date(pkg.createdAt).toISOString(),
          updatedAt: new Date(pkg.updatedAt).toISOString(),
          servicePackageRecords: pkg.servicePackageRecords?.map(
            (record: any) => ({
              ...record,
              includedService: {
                ...record.includedService,
                price: Number(record.includedService.price),
              },
            })
          ),
        }))
        setPackages(serializedPackages)
      }
    } catch (error) {
      
    }
  }

  const handleSave = async (
    packageData: {
      name: string
      description?: string
      basePrice: string
      currency: string
      isActive: boolean
    },
    services?: { serviceId: string; quantity: number }[]
  ) => {
    setIsLoading(true)

    try {
      const url = editingPackage
        ? `/api/admin/packages/${editingPackage.id}`
        : '/api/admin/packages'
      const method = editingPackage ? 'PUT' : 'POST'

      const requestBody = {
        ...packageData,
        services: services || [],
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error('Failed to save package')
      }

      const savedPackage = await response.json()

      // Serialize the package for the client component
      const serializedPackage = {
        ...savedPackage,
        basePrice: Number(savedPackage.basePrice),
        createdAt: new Date(savedPackage.createdAt).toISOString(),
        updatedAt: new Date(savedPackage.updatedAt).toISOString(),
        servicePackageRecords: savedPackage.servicePackageRecords?.map(
          (record: any) => ({
            ...record,
            includedService: {
              ...record.includedService,
              price: Number(record.includedService.price),
            },
          })
        ),
      }

      if (editingPackage) {
        setPackages(prev =>
          prev.map(item =>
            item.id === editingPackage.id ? serializedPackage : item
          )
        )
        toast.success('Package updated successfully')
      } else {
        setPackages(prev => [...prev, serializedPackage])
        toast.success('Package created successfully')
      }

      setShowForm(false)
      setEditingPackage(undefined)
      // Refresh to get updated list with services
      await refreshPackages()
    } catch (error) {
      
      toast.error('Error saving package')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (packageData: Package) => {
    setEditingPackage(packageData)
    setShowForm(true)
  }

  const handleDelete = (packageData: Package) => {
    setDeleteDialog({ isOpen: true, packageData })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.packageData) return

    setIsDeleting(true)
    try {
      const response = await fetch(
        `/api/admin/packages/${deleteDialog.packageData.id}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete package')
      }

      setPackages(prev =>
        prev.filter(item => item.id !== deleteDialog.packageData!.id)
      )
      toast.success('Package deleted')
      // Refresh to get updated list
      await refreshPackages()
    } catch (error) {
      
      toast.error('Error deleting package')
    } finally {
      setIsDeleting(false)
      setDeleteDialog({ isOpen: false, packageData: null })
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, packageData: null })
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingPackage(undefined)
  }

  const handleCreate = () => {
    setEditingPackage(undefined)
    setShowForm(true)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Packages Management</CardTitle>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Package
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm ? (
          <PackageForm
            packageData={editingPackage}
            onSave={(data, services) => handleSave(data, services)}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Includes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <PackageIcon className="h-8 w-8 text-gray-400" />
                      <p className="text-muted-foreground">No packages found</p>
                      <Button onClick={handleCreate} variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Create your first package
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                packages.map(packageData => (
                  <TableRow key={packageData.id}>
                    <TableCell className="font-medium">
                      {packageData.name}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-sm text-gray-500 truncate">
                        {packageData.description || 'No description'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {packageData.currency} {packageData.basePrice}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {packageData.servicePackageRecords &&
                          packageData.servicePackageRecords.length > 0 ? (
                            <>
                              {packageData.servicePackageRecords
                                .slice(0, 2)
                                .map((record, index) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {record.serviceQuantity}x{' '}
                                    {record.includedService.name}
                                  </Badge>
                                ))}
                              {packageData.servicePackageRecords.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +
                                  {packageData.servicePackageRecords.length - 2}{' '}
                                  more
                                </Badge>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400 text-sm">
                              No services included
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={packageData.isActive ? 'default' : 'secondary'}
                      >
                        {packageData.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(packageData)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(packageData)}
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
        title="Delete Package"
        description={`Are you sure you want to delete "${deleteDialog.packageData?.name || 'this package'}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={isDeleting}
      />
    </Card>
  )
}
