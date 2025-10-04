import z from 'zod'
import { VALIDATION } from './constants'

// Validate server side data
export const bookingSchema = z
  .object({
    studioId: z.string(),
    packageId: z.string().nullable(),
    serviceId: z.string().nullable(),
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
  .refine(data => data.packageId || data.serviceId, {
    message: 'Either packageId or serviceId must be provided',
    path: ['packageId'],
  })

// Validate client side data
export const bookingLeadSchema = z.object({
  fullName: z
    .string()
    .nonempty({ message: 'Full name is required' })
    .min(2, { message: 'Full name must be at least 2 characters' })
    .max(100, { message: 'Full name must be less than 100 characters' })
    .regex(VALIDATION.NAME_REGEX, {
      message: 'Full name must only contain letters and spaces',
    }),
  email: z
    .string()
    .nonempty({ message: 'Email is required' })
    .email({ message: 'Invalid email address' }),
  phoneNumber: z
    .string()
    .regex(VALIDATION.PHONE_REGEX, { message: 'Invalid phone number' })
    .transform(val => val.replace(/\D/g, '')),
  discountCode: z.string().optional(),
})

export const contactFormSchema = z.object({
  firstName: z
    .string()
    .nonempty({ message: 'First name is required' })
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name must be less than 100 characters' })
    .regex(VALIDATION.NAME_REGEX, {
      message: 'Name must only contain letters and spaces',
    }),
  lastName: z
    .string()
    .max(100, { message: 'Name must be less than 100 characters' })
    .regex(VALIDATION.NAME_REGEX, {
      message: 'Name must only contain letters and spaces',
    })
    .optional(),
  email: z
    .email({ message: 'Invalid email address' })
    .nonempty({ message: 'Email is required' }),
  phone: z
    .string()
    .nonempty({ message: 'Phone number is required' })
    .regex(VALIDATION.PHONE_REGEX, { message: 'Invalid phone number' })
    .transform(val => val.replace(/\D/g, ''))
    .optional(),

  message: z
    .string()
    .nonempty({ message: 'Message is required' })
    .min(10, { message: 'Message must be at least 10 characters' })
    .max(1000, { message: 'Message must be less than 1000 characters' }),
})

export const studioSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name must be less than 100 characters' }),
  location: z
    .string()
    .min(2, { message: 'Location must be at least 2 characters' })
    .max(100, { message: 'Location must be less than 100 characters' })
    .optional(),
  openingTime: z.string(),
  closingTime: z.string(),
  totalSeats: z.number(),
})

export const blogRecordSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  tagline: z.string().min(1, { message: 'Tagline is required' }),
  mainText: z.string().min(1, { message: 'Main text is required' }),
})

export const studioImageUploadSchema = z.object({
  studioId: z.string().min(1, { message: 'Studio ID is required' }),
  imageUrl: z.url({ message: 'Invalid image URL' }),
})

export const validateBooking = (data: unknown) => {
  return bookingSchema.safeParse(data)
}

export const validateStudio = (data: unknown) => {
  return studioSchema.safeParse(data)
}

export const validateStudioImageUpload = (data: unknown) => {
  return studioImageUploadSchema.safeParse(data)
}

export const validateContactForm = (data: unknown) => {
  return contactFormSchema.safeParse(data)
}

export const validateBlogRecord = (data: unknown) => {
  return blogRecordSchema.safeParse(data)
}

export type LeadSchema = z.infer<typeof bookingLeadSchema>
export type StudioSchema = z.infer<typeof studioSchema>
export type StudioImageUploadSchema = z.infer<typeof studioImageUploadSchema>
export type ContactFormSchema = z.infer<typeof contactFormSchema>
export type BlogRecordSchema = z.infer<typeof blogRecordSchema>
