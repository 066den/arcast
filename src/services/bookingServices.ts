import { ERROR_MESSAGES } from '@/lib/constants'
import { prisma } from '@/lib/prisma'
import { BookingFilters } from '@/types'

export const getAdditionalServices = async () => {
  if (!prisma) {
    throw new Error(ERROR_MESSAGES.PRISMA.NOT_INITIALIZED)
  }

  try {
    const additionalServices = await prisma.additionalService.findMany({
      where: {
        isActive: true,
      },
    })
    return additionalServices.map(service => ({
      ...service,
      price: Number(service.price),
    }))
  } catch (error) {
    console.error('Error fetching additional services:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to fetch additional services: ${error.message}`)
    }
    throw new Error('Failed to fetch additional services')
  }
}

export const getBookings = async (filters: BookingFilters = {}) => {
  if (!prisma) {
    throw new Error(ERROR_MESSAGES.PRISMA.NOT_INITIALIZED)
  }

  const {
    status,
    dateFrom,
    dateTo,
    studioId,
    packageId,
    limit,
    offset,
    sortBy,
    sortOrder,
  } = filters
}
