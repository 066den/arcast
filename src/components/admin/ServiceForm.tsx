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
import { Save, X, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Service } from '@/types'

const serviceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  serviceTypeId: z.string().min(1, 'Service type is required'),
  price: z.string().min(1, 'Price is required'),
  currency: z.string().min(1, 'Currency is required'),
  isPopular: z.boolean(),
  isActive: z.boolean(),
  sortOrder: z.string().optional(),
})

type ServiceFormData = z.infer<typeof serviceSchema>

interface ServiceType {
  id: string
  name: string
  description?: string | null
}

interface ServiceFormProps {
  service?: Service
  onSave: (data: ServiceFormData, includes?: string[]) => void
  onCancel: () => void
  isLoading?: boolean
}

const ServiceForm = ({
  service,
  onSave,
  onCancel,
  isLoading = false,
}: ServiceFormProps) => {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [includes, setIncludes] = useState<string[]>(service?.includes || [])
  const [newInclude, setNewInclude] = useState('')

  // Helper function to convert Decimal or number to string safely
  const priceToString = (price: unknown): string => {
    if (price == null) return ''
    if (typeof price === 'number') {
      // Convert number to string, preserving precision
      // If it's a whole number, return without decimals, otherwise return as is
      return price % 1 === 0 ? price.toString() : price.toString()
    }
    if (typeof price === 'string') {
      return price
    }
    // For Decimal objects (Prisma), convert to string
    if (typeof price === 'object' && price !== null && 'toString' in price) {
      const decimalStr = (price as { toString: () => string }).toString()
      // Convert to number first to ensure precision, then back to string
      const num = parseFloat(decimalStr)
      return isNaN(num) ? '' : num.toString()
    }
    return ''
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: service?.name || '',
      description: service?.description || '',
      serviceTypeId: service?.serviceTypeId
        ? service?.serviceTypeId
        : serviceTypes.length > 0
          ? serviceTypes[0].id
          : undefined,
      price: priceToString(service?.price),
      currency: service?.currency || 'AED',
      isPopular: service?.isPopular || false,
      isActive: service?.isActive ?? true,
      sortOrder: service?.sortOrder?.toString() || '0',
    },
  })

  useEffect(() => {
    fetchServiceTypes()
  }, [])

  useEffect(() => {
    if (service) {
      setValue('name', service.name || '')
      setValue('description', service.description || '')
      setValue('serviceTypeId', service.serviceTypeId || '')
      setValue('price', priceToString(service.price))
      setValue('currency', service.currency || 'AED')
      setValue('isPopular', service.isPopular || false)
      setValue('isActive', service.isActive ?? true)
      setValue('sortOrder', service.sortOrder?.toString() || '0')
      setIncludes(service.includes || [])
    } else {
      setValue('name', '')
      setValue('description', '')
      setValue('price', '')
      setValue('currency', 'AED')
      setValue('isPopular', false)
      setValue('isActive', true)
      setValue('sortOrder', '0')
      setIncludes([])
    }
  }, [service, setValue])

  const fetchServiceTypes = async () => {
    try {
      const response = await fetch('/api/admin/service-types')
      if (response.ok) {
        const data = await response.json()
        setServiceTypes(data)
      }
    } catch (error) {
      toast.error('Error loading service types')
    }
  }

  const handleFormSubmit = (data: ServiceFormData) => {
    onSave(data, includes)
  }

  const addInclude = () => {
    if (newInclude.trim()) {
      setIncludes(prev => [...prev, newInclude.trim()])
      setNewInclude('')
    }
  }

  const removeInclude = (index: number) => {
    setIncludes(prev => prev.filter((_, i) => i !== index))
  }

  const watchedServiceTypeId = watch('serviceTypeId')
  const watchedIsPopular = watch('isPopular')
  const watchedIsActive = watch('isActive')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{service ? 'Edit Service' : 'Add New Service'}</CardTitle>
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
                <Label size="lg" htmlFor="serviceTypeId">
                  Service Type *
                </Label>
                <Select
                  value={watchedServiceTypeId}
                  onValueChange={value => setValue('serviceTypeId', value)}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        serviceTypes.length > 0
                          ? `${serviceTypes[0]?.name}`
                          : 'No service types found'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.length > 0 ? (
                      serviceTypes
                        .filter(type => type.id && type.id.trim() !== '')
                        .map(type => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))
                    ) : (
                      <SelectItem value="none">
                        No service types found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.serviceTypeId && (
                  <p className="text-sm text-red-500">
                    {errors.serviceTypeId.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label size="lg" htmlFor="price">
                    Price *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...register('price')}
                    error={errors.price?.message}
                  />
                </div>

                <div className="space-y-2">
                  <Label size="lg" htmlFor="currency">
                    Currency *
                  </Label>
                  <Select
                    value={watchedIsActive ? watch('currency') : 'AED'}
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

              <div className="space-y-2">
                <Label size="lg" htmlFor="sortOrder">
                  Sort Order
                </Label>
                <Input
                  id="sortOrder"
                  type="number"
                  {...register('sortOrder')}
                  placeholder="0"
                  error={errors.sortOrder?.message}
                />
                <p className="text-sm text-gray-500">
                  Lower numbers appear first. Default is 0.
                </p>
              </div>

              <div className="space-y-2">
                <Label size="lg">Includes</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newInclude}
                      onChange={e => setNewInclude(e.target.value)}
                      placeholder="Add include item"
                      onKeyPress={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addInclude()
                        }
                      }}
                    />
                    <Button type="button" onClick={addInclude} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {includes.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                      >
                        <span className="flex-1 text-sm">{item}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeInclude(index)}
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

            <div className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPopular"
                    checked={watchedIsPopular}
                    onCheckedChange={checked =>
                      setValue('isPopular', !!checked)
                    }
                  />
                  <Label size="lg" htmlFor="isPopular">
                    Popular Service
                  </Label>
                </div>

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
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="gap-2">
              <Save className="w-4 h-4" />
              {isLoading ? 'Saving...' : 'Save Service'}
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

export default ServiceForm
