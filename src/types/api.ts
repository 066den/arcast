import { AdditionalService, Studio, TimeSlotList } from '.'

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
  packageId: string
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
