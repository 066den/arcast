'use client'
import { useState } from 'react'
import { PackageWithServices, ServiceType } from '../../types'
import ServicesCarousel from '../servicesComponents/ServiceCarousel'
import ServiceTypesList from '../servicesComponents/ServiceTypesList'
import {
  SCROLL_TARGETS,
  useScrollNavigation,
} from '@/hooks/useScrollNavigation'

interface ChooseServiceOrPackageProps {
  initialServiceTypes: ServiceType[]
  initialPackages: PackageWithServices[]
}

const ChooseServiceOrPackage = ({
  initialServiceTypes,
  initialPackages,
}: ChooseServiceOrPackageProps) => {
  const [typePackages, setTypePackages] = useState<string>('podcast')

  useScrollNavigation()

  return (
    <section id={SCROLL_TARGETS.BOOKING.SERVICES}>
      <h2>
        Choose <span className="text-accent">service</span> or{' '}
        <span className="text-accent">package</span>
      </h2>
      <div className="flex flex-col items-start lg:items-center lg:gap-18 gap-10 py-6">
        <ServiceTypesList
          withBenefits
          isBooking
          typePackages={typePackages}
          initialServiceTypes={initialServiceTypes}
          setTypePackages={setTypePackages}
        />
        <ServicesCarousel
          isBooking
          serviceType={initialServiceTypes}
          typePackages={typePackages}
          packages={initialPackages}
        />
      </div>
    </section>
  )
}

export default ChooseServiceOrPackage
