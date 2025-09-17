import { BOOKING_STATUS } from '@/lib/constants'
import { Decimal } from '@prisma/client/runtime/library'

type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS]

export type NoneToVoidFunction = () => void

export interface Booking {
  id: string
  startTime: Date
  endTime: Date
  numberOfSeats: number
  totalCost: number | Decimal
  vatAmount: number | Decimal
  discountAmount: number | Decimal | null
  status: BookingStatus
  studioId: string
  packageId: string
  leadId: string
  discountCodeId: string | null
  createdAt: Date
  updatedAt: Date
  studio?: Studio
  package?: StudioPackage
  lead?: Lead
  discountCode?: string
  notionEntryId?: string
}

export interface Lead {
  id: string
  fullName: string
  email: string | null
  phoneNumber: string | null
  whatsappNumber: string | null
  recordingLocation: string | null
  createdAt: Date
  updatedAt: Date
}

export type Studio = {
  id: string
  name: string
  location: string
  imageUrl: string | null
  totalSeats: number
  openingTime: string
  closingTime: string
  description?: string
  capacity?: number
  //  isFullyBooked: boolean
  // availableSlots: number
  // totalSlots: number
  bookings?: Booking[]
  //packages?: StudioPackage[]
}

export interface StudioPackage {
  id: string
  name: string
  price_per_hour: number | Decimal
  currency: string
  description: string
  delivery_time: number
  packagePerks?: PackagePerk[]
  createdAt: Date
  updatedAt: Date
}

export interface PackagePerk {
  id: string
  name: string
  packageId: string
  count?: number | null
}

export interface AdditionalService {
  id: string
  title: string
  type: 'STANDARD_EDIT_SHORT_FORM' | 'BY_THREE'
  price: number
  currency: string
  description: string
  imageUrls: string[]
  quantity?: number
  isActive?: boolean
  count?: number
  order?: number
}

export interface Feature {
  title: string
  description: string
  icon: string
  color: 'blue' | 'purple' | 'green'
}

export interface NavigationItem {
  name: string
  href: string
}

export interface ContactForm {
  firstName: string
  lastName: string
  email: string
  message: string
}

export interface SiteConfig {
  name: string
  description: string
  url: string
  ogImage: string
  links: {
    twitter: string
    github: string
  }
}

export interface TimeSlotList {
  available: boolean
  end: string
  start: string
  duration?: number
}
