import { ERROR_MESSAGES } from '@/lib/constants'
import { prisma } from '@/lib/prisma'
//import { generateAvailableTimeSlots } from '../utils/time'
//import { Booking } from '../types'

export const getStudios = async () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Get two weeks from now for regular studios
  const twoWeeksFromNow = new Date(today)
  twoWeeksFromNow.setDate(today.getDate() + 14)

  // Set target Friday for mobile studio (Feb 21, 2025)
  const targetFriday = new Date('2025-02-21')
  targetFriday.setHours(0, 0, 0, 0)

  if (!prisma) {
    throw new Error(ERROR_MESSAGES.PRISMA.NOT_INITIALIZED)
  }
  //throw new Error('test')
  try {
    const studios = await prisma.studio.findMany({
      orderBy: [{ createdAt: 'asc' }, { name: 'asc' }],
      include: {
        bookings: {
          where: {
            AND: [
              {
                status: {
                  not: 'CANCELLED',
                },
              },
              {
                startTime: {
                  gte: today,
                },
              },
            ],
          },
        },
      },
    })

    const studiosWithAvailability = studios.map(studio => {
      return {
        ...studio,
        description: `Professional recording studio with ${studio.totalSeats} seats, located in ${studio.location}. Available from ${studio.openingTime} to ${studio.closingTime}.`,
        capacity: studio.totalSeats,
        bookings: [],
      }
    })

    return studiosWithAvailability
  } catch (error) {
    console.error('Error fetching studios:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to fetch studios: ${error.message}`)
    }
    throw new Error('Failed to fetch studios')
  }
}

export const getPackages = async () => {
  if (!prisma) {
    throw new Error('Prisma client is not initialized')
  }

  try {
    const packages = await prisma.package.findMany({
      include: {
        servicePackageRecords: {
          include: {
            includedService: true,
          },
        },
      },
      orderBy: {
        basePrice: 'asc',
      },
    })

    return packages.map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      pricePerHour: pkg.basePrice.toString(),
      currency: pkg.currency,
      description: pkg.description,
      deliveryTime: '24-48 hours', // Default delivery time
      features: pkg.servicePackageRecords.map(record =>
        record.serviceQuantity > 1
          ? `${record.serviceQuantity}x ${record.includedService.name}`
          : record.includedService.name
      ),
      popular: false, // You can add logic to determine popularity
      studioIds: [], // Packages are not directly linked to studios in current schema
    }))
  } catch (error) {
    console.error('Error fetching packages:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to fetch packages: ${error.message}`)
    }
    throw new Error('Failed to fetch packages')
  }
}

export const getSamples = async () => {
  if (!prisma) {
    throw new Error(ERROR_MESSAGES.PRISMA.NOT_INITIALIZED)
  }
  try {
    const samples = await prisma.sample.findMany({})
    return samples
  } catch (error) {
    console.error('Error fetching samples:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to fetch samples: ${error.message}`)
    }
    throw new Error('Failed to fetch samples')
  }
}

export const getSamplesByServiceType = async (serviceTypeId: string) => {
  if (!prisma) {
    throw new Error(ERROR_MESSAGES.PRISMA.NOT_INITIALIZED)
  }
  try {
    const samples = await prisma.sample.findMany({})
    return samples
  } catch (error) {
    console.error('Error fetching samples by service type:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to fetch samples: ${error.message}`)
    }
    throw new Error('Failed to fetch samples')
  }
}

export const getCases = async () => {
  if (!prisma) {
    throw new Error(ERROR_MESSAGES.PRISMA.NOT_INITIALIZED)
  }
  try {
    const cases = await prisma.caseStudy.findMany({
      where: {
        isActive: true,
      },
      include: {
        client: true,
        equipment: true, // Direct relation to equipment
        staff: true, // Direct relation to staff
        caseContent: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    })
    return cases
  } catch (error) {
    console.error('Error fetching cases:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to fetch cases: ${error.message}`)
    }
    throw new Error('Failed to fetch cases')
  }
}

export const getCaseById = async (id: string) => {
  if (!prisma) {
    throw new Error(ERROR_MESSAGES.PRISMA.NOT_INITIALIZED)
  }
  try {
    const caseStudy = await prisma.caseStudy.findUnique({
      where: { id },
      include: {
        client: true,
        equipment: true, // Direct relation to equipment
        staff: true, // Direct relation to staff
        caseContent: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    })
    return caseStudy
  } catch (error) {
    console.error('Error fetching case:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to fetch case: ${error.message}`)
    }
    throw new Error('Failed to fetch case')
  }
}

export const getClients = async () => {
  if (!prisma) {
    throw new Error(ERROR_MESSAGES.PRISMA.NOT_INITIALIZED)
  }
  try {
    const clients = await prisma.client.findMany()
    return clients
  } catch (error) {
    console.error('Error fetching clients:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to fetch clients: ${error.message}`)
    }
    throw new Error('Failed to fetch clients')
  }
}
