import { Suspense } from 'react'
import { Preloader } from '@/components/ui/preloader'
import BookingsTable from '@/components/admin/BookingsTable'
import { fetchBookings } from '@/services/bookingServices'

export default async function AdminPage() {
  const bookings = await fetchBookings()

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serializedBookings = bookings.map((b: any) => ({
    ...b,
    totalCost: toNumber(b.totalCost),
    vatAmount: b.vatAmount != null ? toNumber(b.vatAmount) : null,
    discountAmount:
      b.discountAmount != null ? toNumber(b.discountAmount) : null,
    finalAmount: b.finalAmount != null ? toNumber(b.finalAmount) : null,
    service: b.service
      ? {
          ...b.service,
          price:
            b.service.price != null ? toNumber(b.service.price) : undefined,
        }
      : undefined,
    contentPackage: b.contentPackage
      ? {
          ...b.contentPackage,
          basePrice:
            b.contentPackage.basePrice != null
              ? toNumber(b.contentPackage.basePrice)
              : undefined,
        }
      : undefined,
    payment: b.payment
      ? {
          ...b.payment,
          amount:
            b.payment?.amount != null
              ? toNumber(b.payment?.amount as unknown)
              : undefined,
        }
      : undefined,
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
          service: (s as { service?: { price?: unknown } }).service
            ? {
                ...(s as { service?: { price?: unknown } }).service!,
                price:
                  (s as { service?: { price?: unknown } }).service?.price !=
                  null
                    ? toNumber(
                        (s as { service?: { price?: unknown } }).service?.price
                      )
                    : undefined,
              }
            : undefined,
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
