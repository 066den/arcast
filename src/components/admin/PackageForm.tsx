'use client'

import { useState, useEffect } from 'react'
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
import { Save, Plus, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

const packageSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  basePrice: z.string().min(1, 'Base price is required'),
  currency: z.string().min(1, 'Currency is required'),
  isActive: z.boolean(),
})

type PackageFormData = z.infer<typeof packageSchema>

interface Service {
  id: string
  name: string
  serviceType?: {
    name: string
  }
}

interface ServiceItem {
  serviceId: string
  quantity: number
}

interface Package {
  id: string
  name: string
  description: string | null
  basePrice: number
  currency: string
  isActive: boolean
  servicePackageRecords?: Array<{
    includedService: Service
    serviceQuantity: number
  }>
}

interface PackageFormProps {
  packageData?: Package
  onSave: (data: PackageFormData, services?: ServiceItem[]) => void
  onCancel: () => void
  isLoading?: boolean
}

const PackageForm = ({
  packageData,
  onSave,
  onCancel,
  isLoading = false,
}: PackageFormProps) => {
  const [services, setServices] = useState<Service[]>([])
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([])
  const [newServiceId, setNewServiceId] = useState('')
  const [newServiceQuantity, setNewServiceQuantity] = useState('1')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: packageData?.name || '',
      description: packageData?.description || '',
      basePrice: packageData?.basePrice?.toString() || '',
      currency: packageData?.currency || 'AED',
      isActive: packageData?.isActive ?? true,
    },
  })

  useEffect(() => {
    fetchServices()
    if (packageData?.servicePackageRecords) {
      const initialServices = packageData.servicePackageRecords.map(record => ({
        serviceId: record.includedService.id,
        quantity: record.serviceQuantity,
      }))
      setSelectedServices(initialServices)
    }
  }, [packageData])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/admin/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      }
    } catch (error) {
      toast.error('Error loading services')
    }
  }

  const handleFormSubmit = (data: PackageFormData) => {
    onSave(data, selectedServices)
  }

  const addService = () => {
    if (!newServiceId) {
      toast.error('Please select a service')
      return
    }

    // Check if service already added
    if (selectedServices.find(s => s.serviceId === newServiceId)) {
      toast.error('This service is already added')
      return
    }

    setSelectedServices(prev => [
      ...prev,
      {
        serviceId: newServiceId,
        quantity: parseInt(newServiceQuantity) || 1,
      },
    ])

    setNewServiceId('')
    setNewServiceQuantity('1')
  }

  const removeService = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(s => s.serviceId !== serviceId))
  }

  const updateServiceQuantity = (serviceId: string, quantity: number) => {
    setSelectedServices(prev =>
      prev.map(s => (s.serviceId === serviceId ? { ...s, quantity } : s))
    )
  }

  const watchedIsActive = watch('isActive')
  const watchedCurrency = watch('currency')

  const getServiceName = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    return service?.name || 'Unknown Service'
  }

  const getServiceTypeName = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    return service?.serviceType?.name || ''
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {packageData ? 'Edit Package' : 'Add New Package'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label size="lg" htmlFor="name">
                  Name *
                </Label>
                <Input
                  id="name"
                  {...register('name')}
                  error={errors.name?.message}
                />
              </div>

              <div className="space-y-2">
                <Label size="lg" htmlFor="description">
                  Description
                </Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label size="lg" htmlFor="basePrice">
                    Base Price *
                  </Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    {...register('basePrice')}
                    error={errors.basePrice?.message}
                  />
                </div>

                <div className="space-y-2">
                  <Label size="lg" htmlFor="currency">
                    Currency *
                  </Label>
                  <Select
                    value={watchedCurrency || 'AED'}
                    onValueChange={value => setValue('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AED">AED</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={watchedIsActive}
                  onCheckedChange={checked => setValue('isActive', !!checked)}
                />
                <Label size="lg" htmlFor="isActive">
                  Active
                </Label>
              </div>

              <div className="space-y-2">
                <Label size="lg">Included Services</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Select
                      value={newServiceId}
                      onValueChange={setNewServiceId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services
                          .filter(
                            service => service.id && service.id.trim() !== ''
                          )
                          .map(service => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name}
                              {service.serviceType && (
                                <span className="text-xs text-gray-500 ml-2">
                                  ({service.serviceType.name})
                                </span>
                              )}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      value={newServiceQuantity}
                      onChange={e => setNewServiceQuantity(e.target.value)}
                      placeholder="Qty"
                      className="w-20"
                      min="1"
                    />
                    <Button type="button" onClick={addService}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedServices.map(serviceItem => (
                      <div
                        key={serviceItem.serviceId}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                      >
                        <Badge variant="secondary" className="flex-1 text-left">
                          {getServiceName(serviceItem.serviceId)}
                          {getServiceTypeName(serviceItem.serviceId) && (
                            <span className="text-xs ml-2 text-gray-500">
                              ({getServiceTypeName(serviceItem.serviceId)})
                            </span>
                          )}
                        </Badge>
                        <Input
                          type="number"
                          value={serviceItem.quantity}
                          onChange={e =>
                            updateServiceQuantity(
                              serviceItem.serviceId,
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-20"
                          min="1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeService(serviceItem.serviceId)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="gap-2">
              <Save className="w-4 h-4" />
              {isLoading ? 'Saving...' : 'Save Package'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default PackageForm
