'use client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ContactFormSchema, contactFormSchema } from '@/lib/schemas'
import {
  API_ENDPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '@/lib/constants'
import { toast } from 'sonner'
import InputPhone from '../ui/InputPhone'
import { apiRequest } from '@/lib/api'

const ContactForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    trigger,
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

  const handlePhoneChange = (value: string) => {
    setValue('phone', value)
    trigger('phone')
  }

  const onSubmit = handleSubmit(async (formData: ContactFormSchema) => {
    try {
      await apiRequest(API_ENDPOINTS.CONTACT, {
        method: 'POST',
        body: JSON.stringify(formData),
      })
      toast.success(SUCCESS_MESSAGES.CONTACT.SUBMITTED)
      reset()
    } catch (error) {
      console.error('Error submitting contact form:', error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error(ERROR_MESSAGES.CONTACT.FAILED)
      }
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Form</CardTitle>
        <CardDescription>
          Fill out the form below and we&apos;ll get back to you as soon as
          possible.
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                error={errors.firstName?.message}
                {...register('firstName')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <InputPhone
                id="phone"
                onChangeValue={handlePhoneChange}
                error={errors.phone?.message}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Your message here..."
              className="min-h-[100px]"
              {...register('message')}
            />
            {errors.message && (
              <p className="text-red-500 text-sm mt-1">
                {errors.message.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>
        </CardContent>
      </form>
    </Card>
  )
}

export default ContactForm
