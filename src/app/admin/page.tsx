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

  // Convert Prisma Decimal fields to numbers to satisfy Client Component serialization
  const hasToString = (v: unknown): v is { toString: () => string } => {
    return (
      v !== null &&
      typeof v === 'object' &&
      typeof (v as { toString?: unknown }).toString === 'function'
    )
  }

  const toNumber = (value: unknown): number | unknown => {
    if (hasToString(value)) {
      try {
        const str = value.toString()
        if (!Number.isNaN(Number(str))) return Number(str)
      } catch {}
    }
    return value as unknown
  }

  const serializedBookings = bookings.map(b => ({
    ...b,
    totalCost: toNumber(b.totalCost),
    vatAmount: b.vatAmount != null ? toNumber(b.vatAmount) : null,
    discountAmount:
      b.discountAmount != null ? toNumber(b.discountAmount) : null,
    finalAmount: b.finalAmount != null ? toNumber(b.finalAmount) : null,
    bookingAdditionalServices:
      b.bookingAdditionalServices?.map(
        (
          s: { unitPrice: unknown; totalPrice: unknown } & Record<
            string,
            unknown
          >
        ) => ({
          ...s,
          unitPrice: toNumber(s.unitPrice),
          totalPrice: toNumber(s.totalPrice),
        })
      ) ?? [],
  }))

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
        <BookingsTable
          initialData={
            serializedBookings as unknown as import('@/types').Booking[]
          }
        />
      </Suspense>
    </div>
  )
}
