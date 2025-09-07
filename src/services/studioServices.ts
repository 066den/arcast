import { prisma } from '@/lib/prisma'
import { generateAvailableTimeSlots } from '../utils/time'

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
      include: {
        packages: {
          include: {
            packagePerks: true,
          },
        },
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
      // Determine the end date based on studio type
      const endDate =
        studio.name === 'Mobile Studio Service' ? targetFriday : twoWeeksFromNow

      // Filter bookings within the relevant date range
      const relevantBookings = studio.bookings.filter(booking => {
        const bookingStart = new Date(booking.startTime)
        const bookingEnd = new Date(booking.endTime)
        return (
          // Check if booking overlaps with the date range
          (bookingStart >= today && bookingStart <= endDate) ||
          (bookingEnd >= today && bookingEnd <= endDate) ||
          (bookingStart <= today && bookingEnd >= endDate)
        )
      })

      // Generate time slots with the proper end date
      const timeSlots = generateAvailableTimeSlots(
        studio.openingTime,
        studio.closingTime,
        relevantBookings,
        endDate
      )

      // Calculate actual availability
      const availableSlots = timeSlots.filter(slot => slot.available).length
      //console.log(studio)
      // Transform studio data to match frontend expectations

      return {
        ...studio,
        packages: studio.packages.map(pkg => ({
          ...pkg,
          price_per_hour: Number(pkg.price_per_hour),
        })),
        description: `Professional recording studio with ${studio.totalSeats} seats, located in ${studio.location}. Available from ${studio.openingTime} to ${studio.closingTime}.`,
        capacity: studio.totalSeats,

        // Availability information
        isFullyBooked:
          studio.name === 'Mobile Studio Service'
            ? false
            : availableSlots === 0,
        availableSlots:
          studio.name === 'Mobile Studio Service'
            ? timeSlots.length
            : availableSlots,
        totalSlots: timeSlots.length,
        // Exclude bookings from response to reduce payload size
        bookings: undefined,
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
    const packages = await prisma.studioPackage.findMany({
      include: {
        packagePerks: true,
      },
    })

    return packages.map(pkg => ({
      ...pkg,
      price_per_hour: Number(pkg.price_per_hour),
    }))
  } catch (error) {
    console.error('Error fetching packages:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to fetch packages: ${error.message}`)
    }
    throw new Error('Failed to fetch packages')
  }
}
