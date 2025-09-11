import { BOOKING_STATUS } from '@/lib/constants'
export interface Booking {
  id: string
  startTime: string // ISO 8601 format "YYYY-MM-DDTHH:mm:ss.sssZ"
  endTime: string // ISO 8601 format
  numberOfSeats: number
  totalCost: number // Assuming it's a string (e.g., "3800"), change to number if needed
  vatAmount: number
  discountAmount: number
  status: typeof BOOKING_STATUS // Enum-like restriction
  studioId: string
  packageId: string
  leadId: string
  discountCodeId: string | null
  createdAt: string
  updatedAt: string
  studio: Studio
  package: StudioPackage
  lead: Lead
  discountCode: string | null
  notionEntryId: string
}

export interface BookingFilters {
  status?: string
  dateFrom?: string
  dateTo?: string
  studioId?: string
  packageId?: string
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: string
}

export interface Lead {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  recordingLocation: string
  createdAt: string
  updatedAt: string
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
  packages?: StudioPackage[]
}

export interface StudioPackage {
  id: string
  name: string
  price_per_hour: number
  currency: string
  description: string
  delivery_time: number
  packagePerks: PackagePerk[]
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
  type:
    | 'STANDARD_EDIT_SHORT_FORM'
    | 'CUSTOM_EDIT_SHORT_FORM'
    | 'STANDARD_EDIT_LONG_FORM'
    | 'CUSTOM_EDIT_LONG_FORM'
    | 'LIVE_VIDEO_CUTTING'
    | 'SUBTITLES'
    | 'TELEPROMPTER_SUPPORT'
    | 'MULTI_CAM_RECORDING'
    | 'EPISODE_TRAILER_LONG_FORM'
    | 'EPISODE_TRAILER_SHORT_FORM'
    | 'WARDROBE_STYLING_CONSULTATION'
    | 'PODCAST_DISTRIBUTION'
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
