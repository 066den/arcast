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
    throw new Error('Prisma client is not initialized')
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

    // Add availability information to each studio
    const studiosWithAvailability = studios.map(studio => {
      return {
        ...studio,
        description: `Professional recording studio with ${studio.totalSeats} seats, located in ${studio.location}. Available from ${studio.openingTime} to ${studio.closingTime}.`,
        capacity: studio.totalSeats,
        // Exclude bookings from response to reduce payload size
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

  // try {
  //   const packages = await prisma.studioPackage.findMany({
  //     include: {
  //       packagePerks: true,
  //     },
  //   })

  //   return packages.map(pkg => ({
  //     ...pkg,
  //     basePrice: Number(pkg.price_per_hour),
  //   }))
  // } catch (error) {
  //   console.error('Error fetching packages:', error)
  //   if (error instanceof Error) {
  //     throw new Error(`Failed to fetch packages: ${error.message}`)
  //   }
  //   throw new Error('Failed to fetch packages')
  // }
}
