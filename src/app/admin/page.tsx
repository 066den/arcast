import { Suspense } from 'react'
import { Preloader } from '@/components/ui/preloader'
import BookingsTable from '@/components/admin/BookingsTable'
import { prisma } from '@/lib/prisma'

async function fetchBookings() {
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
    console.error('Error fetching bookings:', error)
    return []
  }
}

export default async function AdminPage() {
  const bookings = await fetchBookings()

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Bookings Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage bookings and update their status
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <Preloader variant="spinner" size="xl" text="Loading bookings..." />
          </div>
        }
      >
        <BookingsTable initialData={bookings} />
      </Suspense>
    </div>
  )
}
