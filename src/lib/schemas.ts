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

export const orderSchema = z.object({
  serviceId: z.string(),
  description: z.string().optional(),
  requirements: z.string().optional(),
  estimatedDays: z.number().optional(),
  deadline: z.string().optional(),
  lead: z.object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.email().optional(),
    phoneNumber: z.string().optional(),
    whatsappNumber: z.string().optional(),
  }),
  discountCode: z.string().nullable(),
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
    .email({ message: 'Invalid email address' })
    .nonempty({ message: 'Email is required' }),
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

export const callRequestFormSchema = z.object({
  firstName: z
    .string()
    .nonempty({ message: 'First name is required' })
    .min(2, { message: 'First name must be at least 2 characters' })
    .max(100, { message: 'First name must be less than 100 characters' })
    .regex(VALIDATION.NAME_REGEX, {
      message: 'First name must only contain letters and spaces',
    }),
  lastName: z
    .string()
    .max(100, { message: 'Last name must be less than 100 characters' })
    .regex(VALIDATION.NAME_REGEX, {
      message: 'Last name must only contain letters and spaces',
    })
    .optional(),
  phone: z
    .string()
    .nonempty({ message: 'Phone number is required' })
    .regex(VALIDATION.PHONE_REGEX, { message: 'Invalid phone number' })
    .transform(val => val.replace(/\D/g, '')),
  callDateTime: z
    .string()
    .nonempty({ message: 'Call date & time is required' })
    .refine(
      date => {
        const selectedDate = new Date(date)
        const now = new Date()
        return selectedDate > now
      },
      { message: 'Call date & time must be in the future' }
    ),
})

const studioSchemaBase = z.object({
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
})

export const studioSchema = studioSchemaBase.extend({
  totalSeats: z
    .number()
    .positive({ message: 'Total seats must be a positive number' }),
})

export const studioFormSchema = studioSchemaBase.extend({
  totalSeats: z.coerce
    .number()
    .positive({ message: 'Total seats must be a positive number' }),
})

export const blogRecordSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  tagline: z.string().min(1, { message: 'Tagline is required' }),
  mainText: z.string().min(1, { message: 'Main text is required' }),
})

export const discountCodeSchema = z.object({
  code: z
    .string()
    .min(1, { message: 'Code is required' })
    .max(50, { message: 'Code must be less than 50 characters' })
    .regex(/^[A-Z0-9_-]+$/, {
      message:
        'Code must contain only uppercase letters, numbers, underscores, and hyphens',
    }),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT'], {
    message: 'Type is required',
  }),
  value: z.coerce.number().positive({ message: 'Value must be positive' }),
  currency: z.string().default('AED'),
  isActive: z.boolean().default(true),
  startDate: z.string().min(1, { message: 'Start date is required' }),
  endDate: z.string().min(1, { message: 'End date is required' }),
  usageLimit: z.coerce
    .number()
    .positive({ message: 'Usage limit must be positive' })
    .nullable()
    .optional(),
  firstTimeOnly: z.boolean().default(false),
  minOrderAmount: z.coerce
    .number()
    .positive({ message: 'Minimum order amount must be positive' })
    .nullable()
    .optional(),
  applicableContentTypes: z.array(z.string()).default([]),
})

export const studioImageUploadSchema = z.object({
  studioId: z.string().min(1, { message: 'Studio ID is required' }),
  imageUrl: z.url({ message: 'Invalid image URL' }),
})

export const validateBooking = (data: unknown) => {
  return bookingSchema.safeParse(data)
}

export const validateOrder = (data: unknown) => {
  return orderSchema.safeParse(data)
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

export const validateCallRequestForm = (data: unknown) => {
  return callRequestFormSchema.safeParse(data)
}

export const validateBlogRecord = (data: unknown) => {
  return blogRecordSchema.safeParse(data)
}

export const validateDiscountCode = (data: unknown) => {
  return discountCodeSchema.safeParse(data)
}

export type LeadSchema = z.infer<typeof bookingLeadSchema>
export type StudioSchema = z.infer<typeof studioSchema>
export type StudioFormSchema = z.infer<typeof studioFormSchema>
export type StudioImageUploadSchema = z.infer<typeof studioImageUploadSchema>
export type ContactFormSchema = z.infer<typeof contactFormSchema>
export type CallRequestFormSchema = z.infer<typeof callRequestFormSchema>
export type BlogRecordSchema = z.infer<typeof blogRecordSchema>
export type OrderSchema = z.infer<typeof orderSchema>
export type DiscountCodeSchema = z.infer<typeof discountCodeSchema>
