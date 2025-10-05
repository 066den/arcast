import { OrderStatus } from '@prisma/client'
import { AdditionalService, Lead, Package, TimeSlotList, Studio } from '.'

export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
  details?: {
    field: string
    message: string
  }[]
}

export interface ApiResponseAvailablity {
  success: boolean
  studio: Studio
  availability: {
    timeSlots: TimeSlotList[]
    date: string
    studioId: string
  }
}

export interface BookingFormData {
  studioId: string
  packageId: string | null
  serviceId: string | null
  numberOfSeats: number
  selectedTime: string
  duration: number
  discountCode: string | null
  lead: {
    fullName: string
    email: string
    phoneNumber: string
    whatsappNumber: string
    recordingLocation?: string
  }
  additionalServices: AdditionalService[]
}

export interface StudioFormData {
  name: string
  location?: string
  imageFile?: File | null
  openingTime: string
  closingTime: string
  totalSeats?: number
}

export interface MamoPaymentLinkResponse {
  id: string
  payment_url: string
  title: string
  description: string
  amount: number
  amount_currency: string
}

export interface BookingResponse {
  id: string
  startTime: Date
  endTime: Date
  totalCost: number
  vatAmount: number
  discountAmount: number
  finalAmount?: number
  studio?: Studio
  package?: Package
  lead?: Lead
  additionalServices?: AdditionalService[]
  paymentUrl?: string
}

export interface OrderResponse {
  id: string
  serviceName: string
  totalCost: number
  finalAmount?: number
  discountAmount?: number
  status: OrderStatus
  estimatedDays?: number
  deadline?: Date
  paymentUrl?: string
}
