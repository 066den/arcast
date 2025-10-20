import { Suspense } from 'react'
import { Preloader } from '@/components/ui/preloader'
import DiscountCodesTable from '@/components/admin/DiscountCodesTable'
import { prisma } from '@/lib/prisma'

async function fetchCodes() {
  const codes = await prisma.discountCode.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return codes.map(c => ({
    ...c,
    value: Number(c.value),
    minOrderAmount: c.minOrderAmount ? Number(c.minOrderAmount) : null,
  }))
}

export default async function DiscountCodesPage() {
  const codes = await fetchCodes()
  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Discount Codes</h1>
        <p className="text-muted-foreground mt-2">
          Manage and create discount codes
        </p>
      </div>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <Preloader
              variant="spinner"
              size="xl"
              text="Loading discount codes..."
            />
          </div>
        }
      >
        <DiscountCodesTable initialData={codes as any} />
      </Suspense>
    </div>
  )
}
