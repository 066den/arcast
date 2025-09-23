'use client'
import Image from 'next/image'

import { Package, ServiceType } from '@/types'
import ServiceTypesList from '../servicesPage/ServiceTypesList'

interface PackagesSectionProps {
  initialServiceTypes: ServiceType[]
  initialPackages: Package[]
}

const PackagesSection = ({
  initialServiceTypes,
  initialPackages,
}: PackagesSectionProps) => {
  return (
    <section className="py-20">
      <div className="section-title">what do we provide</div>
      <div className="flex justify-between gap-4 mb-25">
        <div className="mt-2">
          <h2 className="text-6xl mb-4">
            Fully packed <span className="text-accent">services</span>
          </h2>
          <h2 className="text-6xl flex items-center gap-3">
            <Image
              src="/assets/images/pre-beneficial.jpg"
              alt="Beneficial packages"
              width={105}
              height={48}
              className="rounded-full h-12"
            />
            Beneficial <span className="text-accent">packages</span>
          </h2>
        </div>
        <p className="text-secondary max-w-xs">
          Choose a definite service you need, or let us provide a full service
          as a service package.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ServiceTypesList initialServiceTypes={initialServiceTypes} />
      </div>
    </section>
  )
}

export default PackagesSection
