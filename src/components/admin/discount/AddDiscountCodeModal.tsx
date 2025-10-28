'use client'

import { Input } from '@/components/ui/input'
import { Modal } from '@/components/modals/modal'
import { discountCodeSchema } from '@/lib/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { createDiscountCode, updateDiscountCode } from '@/lib/api'
import { toast } from 'sonner'
import { Preloader } from '@/components/ui/preloader'
import { cn } from '@/lib/utils'

interface DiscountCodeData {
  id: string
  code: string
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | string
  value: number
  currency: string
  isActive: boolean
  startDate: string | Date
  endDate: string | Date
  usageLimit?: number | null
  firstTimeOnly?: boolean
  minOrderAmount?: number | null
  applicableContentTypes?: string[]
}

interface AddDiscountCodeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  editingCode?: DiscountCodeData | null
}

const AddDiscountCodeModal = ({
  isOpen,
  onClose,
  onSuccess,
  editingCode,
}: AddDiscountCodeModalProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(discountCodeSchema),
    mode: 'all',
    defaultValues: {
      code: '',
      type: 'PERCENTAGE' as const,
      value: '',
      currency: 'AED',
      isActive: true,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      usageLimit: '',
      firstTimeOnly: false,
      minOrderAmount: '',
      applicableContentTypes: [],
    },
  })

  // Set form values when editing
  useEffect(() => {
    if (editingCode) {
      const startDate =
        editingCode.startDate instanceof Date
          ? editingCode.startDate.toISOString().split('T')[0]
          : new Date(editingCode.startDate).toISOString().split('T')[0]

      const endDate =
        editingCode.endDate instanceof Date
          ? editingCode.endDate.toISOString().split('T')[0]
          : new Date(editingCode.endDate).toISOString().split('T')[0]

      setValue('code', editingCode.code)
      setValue('type', editingCode.type as 'PERCENTAGE' | 'FIXED_AMOUNT')
      setValue('value', editingCode.value.toString())
      setValue('currency', editingCode.currency)
      setValue('isActive', editingCode.isActive)
      setValue('startDate', startDate)
      setValue('endDate', endDate)
      setValue('usageLimit', editingCode.usageLimit?.toString() || '')
      setValue('firstTimeOnly', editingCode.firstTimeOnly || false)
      setValue('minOrderAmount', editingCode.minOrderAmount?.toString() || '')
      setValue(
        'applicableContentTypes',
        editingCode.applicableContentTypes || []
      )
    } else if (isOpen && !editingCode) {
      reset()
    }
  }, [editingCode, isOpen, setValue, reset])

  const watchedType = watch('type')

  const onSubmit = handleSubmit(async formData => {
    try {
      setIsLoading(true)

      const dataToSend = {
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: Number(formData.value),
        currency: formData.currency,
        isActive: formData.isActive,
        startDate: formData.startDate,
        endDate: formData.endDate,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        firstTimeOnly: formData.firstTimeOnly,
        minOrderAmount: formData.minOrderAmount
          ? Number(formData.minOrderAmount)
          : null,
        applicableContentTypes: formData.applicableContentTypes,
      }

      if (editingCode) {
        await updateDiscountCode(editingCode.id, dataToSend)
        toast.success('Discount code updated successfully')
      } else {
        await createDiscountCode(dataToSend)
        toast.success('Discount code created successfully')
      }

      onClose()
      if (!editingCode) reset()
      onSuccess?.()
    } catch {
      toast.error(
        editingCode
          ? 'Failed to update discount code'
          : 'Failed to create discount code'
      )
    } finally {
      setIsLoading(false)
    }
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingCode ? 'Edit Discount Code' : 'Add Discount Code'}
      description={
        editingCode
          ? 'Update discount code details'
          : 'Create a new discount code'
      }
      size="lg"
      className="pb-8 scrollbar-gutter-stable"
    >
      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-full z-10 flex items-center justify-center p-4">
          <Preloader
            variant="wave"
            size="lg"
            text={editingCode ? 'Updating...' : 'Creating...'}
          />
        </div>
      )}
      <form
        onSubmit={onSubmit}
        className={cn(
          'relative flex flex-col gap-4 px-4 transition-opacity duration-300',
          isLoading && 'opacity-0'
        )}
      >
        <div className="flex flex-col gap-2">
          <Label size="lg" htmlFor="code">
            Code *
          </Label>
          <Input
            {...register('code')}
            placeholder="SAVE20"
            error={errors.code?.message}
            onChange={e => {
              register('code').onChange(e)
              e.target.value = e.target.value.toUpperCase()
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label size="lg" htmlFor="type">
            Discount Type *
          </Label>
          <select
            {...register('type')}
            className="h-9 px-3 rounded-md border border-input bg-background"
          >
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED_AMOUNT">Fixed Amount</option>
          </select>
          {errors.type && (
            <p className="text-red-500 text-sm">{errors.type.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label size="lg" htmlFor="value">
            Value * ({watchedType === 'PERCENTAGE' ? 'Percentage' : 'Amount'})
          </Label>
          <Input
            type="number"
            {...register('value')}
            placeholder={watchedType === 'PERCENTAGE' ? '20' : '100'}
            error={errors.value?.message}
            step={watchedType === 'PERCENTAGE' ? '1' : '0.01'}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label size="lg" htmlFor="currency">
            Currency
          </Label>
          <Input
            {...register('currency')}
            placeholder="AED"
            error={errors.currency?.message}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label size="lg" htmlFor="startDate">
            Start Date *
          </Label>
          <Input
            type="date"
            {...register('startDate')}
            error={errors.startDate?.message}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label size="lg" htmlFor="endDate">
            End Date *
          </Label>
          <Input
            type="date"
            {...register('endDate')}
            error={errors.endDate?.message}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label size="lg" htmlFor="usageLimit">
            Usage Limit (optional)
          </Label>
          <Input
            type="number"
            {...register('usageLimit')}
            placeholder="100"
            error={errors.usageLimit?.message}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label size="lg" htmlFor="minOrderAmount">
            Minimum Order Amount (optional)
          </Label>
          <Input
            type="number"
            {...register('minOrderAmount')}
            placeholder="500"
            error={errors.minOrderAmount?.message}
            step="0.01"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register('firstTimeOnly')}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label size="lg" htmlFor="firstTimeOnly">
            First time customers only
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register('isActive')}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label size="lg" htmlFor="isActive">
            Active
          </Label>
        </div>

        <Button type="submit" size="lg" disabled={isLoading}>
          {isLoading
            ? editingCode
              ? 'Updating...'
              : 'Creating...'
            : editingCode
              ? 'Update Discount Code'
              : 'Create Discount Code'}
        </Button>
      </form>
    </Modal>
  )
}

export default AddDiscountCodeModal
