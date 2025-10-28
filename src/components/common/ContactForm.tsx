'use client'
import { useState } from 'react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ContactFormSchema, contactFormSchema } from '@/lib/schemas'

import { Modal } from '../modals/modal'
import InputPhoneNew from '../ui/InputPhoneNew'
import { apiRequest } from '@/lib/api'
import { API_ENDPOINTS, ERROR_MESSAGES } from '@/lib/constants'
import { toast } from 'sonner'
import { AnimatePresence, motion } from 'framer-motion'
import { fadeVariants } from '@/lib/motion-variants'

interface ContactFormProps {
  isOpen: boolean
  onClose: () => void
}

const ContactForm = ({ isOpen, onClose }: ContactFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting, isValid, errors },
  } = useForm({
    resolver: zodResolver(contactFormSchema),
    mode: 'onTouched',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      message: '',
    },
  })

  const phoneValue = watch('phone')

  const handlePhoneChange = (value: string) => {
    setValue('phone', value)
  }

  const [submitSuccess, setSubmitSuccess] = useState(false)

  const onSubmit = handleSubmit(async (formData: ContactFormSchema) => {
    try {
      await apiRequest(API_ENDPOINTS.CONTACT, {
        method: 'POST',
        body: JSON.stringify(formData),
      })
      setSubmitSuccess(true)
      reset()
    } catch (error) {
      
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error(ERROR_MESSAGES.CONTACT.FAILED)
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
      title="Reach us out"
      hideTitle
      className="sm:px-8 pb-8 scrollbar-gutter-stable"
    >
      <h2 className="mb-6">
        Reach <strong>us out</strong>
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              size="md"
              placeholder="john@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
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

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              size="md"
              rows={6}
              placeholder="Your message here..."
              error={errors.message?.message}
              {...register('message')}
            />
          </div>
          <Button
            type="submit"
            className="text-4xl font-hanken-grotesk font-medium w-full mt-8 rounded-2xl h-18"
            size="custom"
            variant="accent"
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
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
            className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-3xl"
          >
            <h3 className="">Thank you for your message!</h3>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  )
}

export default ContactForm
