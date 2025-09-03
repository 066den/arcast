import z from 'zod'
import { VALIDATION } from './constants'

// Validate server side data
export const bookingSchema = z.object({
  studioId: z.string(),
  packageId: z.string(),
  numberOfSeats: z.number(),
  selectedTime: z.string(),
  duration: z.number(),
  discountCode: z.string().nullable(),
  additionalServices: z.array(
    z.object({
      id: z.string(),
      quantity: z.number().optional(),
    })
  ),
  lead: z.object({
    fullName: z.string(),
    email: z.string(),
    phoneNumber: z.string().optional(),
    whatsappNumber: z.string().optional(),
    recordingLocation: z.string().optional(),
  }),
})

// Validate client side data
export const bookingLeadSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: 'Full name must be at least 2 characters' })
    .max(100, { message: 'Full name must be less than 100 characters' })
    .regex(VALIDATION.NAME_REGEX, {
      message: 'Full name must only contain letters and spaces',
    }),
  email: z.email({ message: 'Invalid email address' }),
  phoneNumber: z
    .string()
    .regex(VALIDATION.PHONE_REGEX, { message: 'Invalid phone number' })
    .transform(val => val.replace(/\D/g, '')),
  discountCode: z.string().optional(),
})

export const ContactFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name must be less than 100 characters' })
    .regex(VALIDATION.NAME_REGEX, {
      message: 'Name must only contain letters and spaces',
    }),
  email: z.email({ message: 'Invalid email address' }),
  message: z
    .string()
    .min(10, { message: 'Message must be at least 10 characters' })
    .max(1000, { message: 'Message must be less than 1000 characters' }),
})

export const validateBooking = (data: unknown) => {
  return bookingSchema.safeParse(data)
}

export type LeadSchema = z.infer<typeof bookingLeadSchema>
