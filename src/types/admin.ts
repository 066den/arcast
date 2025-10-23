export type OrderRow = {
  id: string
  serviceName: string
  description?: string | null
  requirements?: string | null
  totalCost: number
  finalAmount?: number | null
  discountAmount?: number | null
  status: string
  estimatedDays?: number | null
  deadline?: string | Date | null
  createdAt: string | Date
  lead: {
    id: string
    fullName: string
    email?: string | null
    phoneNumber?: string | null
  }
  payment?: { id: string; amount?: number; status: string } | null
}

export type ClientRow = {
  id: string
  name?: string | null
  jobTitle?: string | null
  showTitle?: string | null
  testimonial?: string | null
  featured: boolean
  imageUrl?: string | null
}

export type DiscountCode = {
  id: string
  code: string
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | string
  value: number
  currency: string
  isActive: boolean
  startDate: string | Date
  endDate: string | Date
  usageLimit?: number | null
  usedCount?: number
  firstTimeOnly?: boolean
  minOrderAmount?: number | null
}
