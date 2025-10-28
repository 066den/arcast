'use client'
import { useState } from 'react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CallRequestFormSchema, callRequestFormSchema } from '@/lib/schemas'

import { Modal } from '../modals/modal'
import InputPhoneNew from '../ui/InputPhoneNew'
import { apiRequest } from '@/lib/api'
import { API_ENDPOINTS, ERROR_MESSAGES } from '@/lib/constants'
import { toast } from 'sonner'
import { AnimatePresence, motion } from 'framer-motion'
import { fadeVariants } from '@/lib/motion-variants'
import { Calendar } from '../ui/calendar'
import { TimePicker } from '../ui/time-picker'

interface CallRequestFormProps {
  isOpen: boolean
  onClose: () => void
}

const CallRequestForm = ({ isOpen, onClose }: CallRequestFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting, isValid, errors },
  } = useForm({
    resolver: zodResolver(callRequestFormSchema),
    mode: 'onTouched',
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      callDateTime: '',
    },
  })

  const phoneValue = watch('phone')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handlePhoneChange = (value: string) => {
    setValue('phone', value)
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date && selectedTime) {
      const [hours, minutes] = selectedTime.split(':')
      const combinedDateTime = new Date(date)
      combinedDateTime.setHours(parseInt(hours), parseInt(minutes))
      setValue('callDateTime', combinedDateTime.toISOString())
    }
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    if (selectedDate) {
      const [hours, minutes] = time.split(':')
      const combinedDateTime = new Date(selectedDate)
      combinedDateTime.setHours(parseInt(hours), parseInt(minutes))
      setValue('callDateTime', combinedDateTime.toISOString())
    }
  }

  const onSubmit = handleSubmit(async (formData: CallRequestFormSchema) => {
    try {
      await apiRequest(API_ENDPOINTS.CALL_REQUEST, {
        method: 'POST',
        body: JSON.stringify(formData),
      })
      setSubmitSuccess(true)
      reset()
      setSelectedDate(undefined)
      setSelectedTime('')
    } catch (error) {
      
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error(ERROR_MESSAGES.CALL_REQUEST.FAILED)
      }
    }
  })

  const handleClose = () => {
    setSubmitSuccess(false)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
      title="Schedule a Call"
      hideTitle
      className="sm:px-8 pb-8 scrollbar-gutter-stable"
    >
      <h2 className="mb-6">
        Schedule <strong>a Call</strong>
      </h2>
      <form onSubmit={onSubmit}>
        <div className="space-y-7">
          <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                size="md"
                placeholder="John"
                error={errors.firstName?.message}
                {...register('firstName')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                size="md"
                placeholder="Doe"
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <InputPhoneNew
              size="md"
              id="phone"
              value={phoneValue}
              onChangeValue={handlePhoneChange}
              error={errors.phone?.message}
            />
          </div>

          <div className="space-y-4">
            <Label>Call Date & Time</Label>
            <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
              <div className="border border-input rounded-2xl p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={date => date < new Date()}
                  className="w-full"
                />
              </div>

              <TimePicker
                value={selectedTime}
                onChange={handleTimeSelect}
                disabled={!selectedDate}
                size="md"
              />
            </div>
            {errors.callDateTime && (
              <p className="text-red-500 text-sm">
                {errors.callDateTime.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="text-4xl font-hanken-grotesk font-medium w-full mt-8 rounded-2xl h-18"
            size="custom"
            variant="accent"
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? 'Submitting...' : 'Schedule Call'}
          </Button>
        </div>
      </form>
      <AnimatePresence>
        {submitSuccess && (
          <motion.div
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-3xl p-4"
          >
            <h3 className="text-center">
              Thank you! We&apos;ll call you at the scheduled time.
            </h3>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  )
}

export default CallRequestForm
