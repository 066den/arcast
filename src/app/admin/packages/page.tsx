import { Suspense } from 'react'
import { Preloader } from '@/components/ui/preloader'
import PackagesTable from '@/components/admin/PackagesTable'
import { fetchPackagesAdmin } from '@/services/packagesServices'

export default async function PackagesPage() {
  const packages = await fetchPackagesAdmin()

  // Convert Decimal objects to numbers for Client Component
  const serializedPackages = packages.map(pkg => ({
    ...pkg,
    basePrice: Number(pkg.basePrice),
    createdAt: pkg.createdAt.toISOString(),
    updatedAt: pkg.updatedAt.toISOString(),
    servicePackageRecords: pkg.servicePackageRecords?.map(record => ({
      ...record,
      includedService: {
        ...record.includedService,
        price: Number(record.includedService.price),
      },
    })),
    addServicePackageRecords: pkg.addServicePackageRecords?.map(record => ({
      ...record,
      includedAdditionalService: {
        ...record.includedAdditionalService,
        price: Number(record.includedAdditionalService.price),
      },
    })),
  }))

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Packages Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your content packages and pricing
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <Preloader variant="spinner" size="xl" text="Loading packages..." />
          </div>
        }
      >
        <PackagesTable initialData={serializedPackages} />
      </Suspense>
    </div>
  )
}
