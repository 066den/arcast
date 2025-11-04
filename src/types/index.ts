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
  finalAmount?: number | Decimal | null
  status: BookingStatus
  studioId: string | null
  contentPackageId: string | null
  serviceId?: string | null
  leadId: string
  discountCodeId: string | null
  createdAt: Date
  updatedAt: Date
  studio?: Studio
  contentPackage?: Package
  lead?: Lead
  discountCode?: string
  // Optional relations used in admin UI
  service?: Service
  payment?: {
    id: string
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | string
    provider?: string | null
  }
  bookingAdditionalServices?: BookingAdditionalService[]
  notionEntryId?: string
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
  email: string | null
  phoneNumber: string | null
  whatsappNumber: string | null
  recordingLocation: string | null
  createdAt: Date
  updatedAt: Date
  bookings?: Booking[]
  orders?: Order[]
}

export interface Order {
  id: string
  leadId: string
  serviceId: string
  quantity: number
  totalPrice: number
  createdAt: Date
  updatedAt: Date
}

export interface Client {
  id: string
  name: string | null
  imageUrl: string | null
  jobTitle?: string | null
  showTitle?: string | null
  testimonial: string | null
  featured: boolean
}

export type Studio = {
  id: string
  name: string
  location: string
  imageUrl: string | null
  gallery: string[]
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

export interface Package {
  id: string
  name: string
  basePrice: number | Decimal
  currency: string
  description: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PackageService {
  id: string
  name: string
  description: string
  price: number
  quantity: number
}

export interface PackageAdditionalService {
  id: string
  name: string
  type: 'STANDARD' | 'BY_THREE'
  price: number
  currency: string
  count: number
  description: string | null
  imageUrls: string[]
  isActive: boolean
  quantity: number
}

export interface PackageWithServices extends Package {
  services: PackageService[]
  additionalServices: PackageAdditionalService[]
}

export interface PackagePerk {
  id: string
  name: string
  packageId: string
  count?: number | null
}

export interface Service {
  id: string
  name: string
  description: string | null
  includes: string[]
  imageUrl: string | null
  price: number
  currency: string
  isPopular: boolean
  isActive: boolean
  serviceTypeId: string
  serviceType?: {
    slug: string
    name?: string
  }
  type?: string
}

export interface ServiceType {
  id: string
  name: string
  slug: string
  sortOrder: number
  description: string | null
  isActive: boolean
  services?: Service[]
  samples?: Sample[]
}

export interface AdditionalService {
  id: string
  name: string
  type: 'STANDARD' | 'BY_THREE'
  price: number | Decimal
  currency: string
  description: string | null
  imageUrls: string[]
  quantity?: number
  isActive?: boolean
  count?: number
  order?: number
}

export interface SelectedAdditionalService {
  id: string
  quantity: number
}

export interface BookingAdditionalService {
  id: string
  bookingId: string
  serviceId: string
  quantity: number
  unitPrice: number | Decimal
  totalPrice: number | Decimal
  createdAt?: Date | null
  updatedAt?: Date | null
  service?: AdditionalService
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

export interface Sample {
  id: string
  name: string | null
  thumbUrl: string | null
  videoUrl: string | null
  serviceTypeId: string | null
  serviceType?: ServiceType | null
}

export interface CaseStudyContentItem {
  title: string
  text?: string[]
  list?: string[]
}

export interface CaseStudyContent {
  id: string
  caseStudyId: string
  title: string
  text: string[]
  list: string[]
  imageUrl: string
  order: number
}

export interface CaseStudyEquipment {
  id: string
  name?: string | null
  description?: string | null
  imageUrl?: string | null
}

export interface CaseStudyStaff {
  id: string
  name: string | null
  role?: string | null
  imageUrl?: string | null
}

export interface CaseStudy {
  id: string
  clientId: string | null
  title: string | null
  tagline: string | null
  mainText: string | null
  featured: boolean
  imageUrls: string[]
  client?: Client | null
  caseContent?: CaseStudyContent[]
  equipment?: CaseStudyEquipment[]
  staff?: CaseStudyStaff[]
}

export interface BlogRecord {
  id: string
  title: string | null
  tagline: string | null
  mainText: string | null
  mainImageUrl?: string | null
  createdAt: Date
  updatedAt: Date
}
