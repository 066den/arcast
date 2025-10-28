import { prisma } from '@/lib/prisma'

export async function fetchBookings() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        studio: true,
        lead: true,
        contentPackage: true,
        service: true,
        discountCode: true,
        bookingAdditionalServices: {
          include: {
            service: true,
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return bookings
  } catch (error) {
    
    return []
  }
}
