import { Suspense } from 'react'
import { Preloader } from '@/components/ui/preloader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import LeadsTable from '@/components/admin/LeadsTable'
import CallRequestsTable from '@/components/admin/CallRequestsTable'
import { prisma } from '@/lib/prisma'

async function fetchLeads() {
  const leads = await prisma.lead.findMany({
    include: {
      bookings: {
        include: {
          studio: true,
          service: true,
          contentPackage: true,
        },
      },
      orders: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  // Convert Decimal values to numbers for client components
  const toNum = (v: unknown) => {
    if (
      v &&
      typeof v === 'object' &&
      typeof (v as { toString?: unknown }).toString === 'function'
    ) {
      const s = (v as { toString: () => string }).toString()
      const n = Number(s)
      return Number.isNaN(n) ? undefined : n
    }
    return v as unknown
  }

  return leads.map(lead => ({
    ...lead,
    bookings: lead.bookings.map(booking => ({
      ...booking,
      totalCost: toNum(booking.totalCost),
      vatAmount: booking.vatAmount != null ? toNum(booking.vatAmount) : null,
      discountAmount:
        booking.discountAmount != null ? toNum(booking.discountAmount) : null,
      finalAmount:
        booking.finalAmount != null ? toNum(booking.finalAmount) : null,
      service: booking.service
        ? {
            ...booking.service,
            price: toNum(booking.service.price),
          }
        : null,
      contentPackage: booking.contentPackage
        ? {
            ...booking.contentPackage,
            basePrice: toNum(booking.contentPackage.basePrice),
          }
        : null,
    })),
    orders: lead.orders.map(order => ({
      ...order,
      totalCost: toNum(order.totalCost),
      vatAmount: order.vatAmount != null ? toNum(order.vatAmount) : null,
      discountAmount:
        order.discountAmount != null ? toNum(order.discountAmount) : null,
      finalAmount: order.finalAmount != null ? toNum(order.finalAmount) : null,
    })),
  }))
}

async function fetchCallRequests() {
  const callRequests = await prisma.callRequest.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return callRequests
}

export default async function LeadsPage() {
  const [leads, callRequests] = await Promise.all([
    fetchLeads(),
    fetchCallRequests(),
  ])

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Leads</h1>
        <p className="text-muted-foreground mt-2">
          Manage leads and call requests
        </p>
      </div>

      <Tabs defaultValue="leads" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="leads">Leads ({leads.length})</TabsTrigger>
          <TabsTrigger value="call-requests">
            Call Requests ({callRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="mt-6">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-64">
                <Preloader
                  variant="spinner"
                  size="xl"
                  text="Loading leads..."
                />
              </div>
            }
          >
            <LeadsTable initialData={leads} />
          </Suspense>
        </TabsContent>

        <TabsContent value="call-requests" className="mt-6">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-64">
                <Preloader
                  variant="spinner"
                  size="xl"
                  text="Loading call requests..."
                />
              </div>
            }
          >
            <CallRequestsTable initialData={callRequests} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
