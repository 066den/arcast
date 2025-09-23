'use client'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  serviceButtonVariants,
  serviceButtonItemVariants,
} from '@/lib/motion-variants'

import { Package, Service } from '@/types'
import ServiceButton from '../servicesPage/ServiceButton'

interface PackagesSectionProps {
  initialServices: Service[]
  initialPackages: Package[]
}

const PackagesSection = ({
  initialServices,
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
        <motion.div
          className="flex flex-col gap-5"
          variants={serviceButtonVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {initialServices &&
            initialServices.map(service => (
              <motion.div key={service.id} variants={serviceButtonItemVariants}>
                <ServiceButton title={service.name} />
              </motion.div>
            ))}
        </motion.div>
      </div>
    </section>
  )
}

export default PackagesSection
