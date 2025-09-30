'use client'
import { useState } from 'react'
import Image from 'next/image'
import { PackageWithServices, ServiceType } from '@/types'
import ServiceTypesList from '../servicesComponents/ServiceTypesList'
import ServicesCarousel from '../servicesComponents/ServiceCarousel'

interface PackagesSectionProps {
  initialServiceTypes: ServiceType[]
  initialPackages: PackageWithServices[]
}

const PackagesSection = ({
  initialServiceTypes,
  initialPackages,
}: PackagesSectionProps) => {
  const [typePackages, setTypePackages] = useState<string>('podcast')

  return (
    <section className="py-20">
      <div className="section-title">what do we provide</div>
      <div className="flex justify-between gap-4 mb-16">
        <div className="mt-2">
          <h2>
            Fully packed <span className="text-accent">services</span>
          </h2>
          <h2 className="flex items-center gap-3">
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

      <div className="flex items-center justify-between gap-10">
        <ServiceTypesList
          withBenefits
          typePackages={typePackages}
          initialServiceTypes={initialServiceTypes}
          setTypePackages={setTypePackages}
        />
        <ServicesCarousel
          serviceType={initialServiceTypes}
          typePackages={typePackages}
          packages={initialPackages}
        />
      </div>
    </section>
  )
}

export default PackagesSection
