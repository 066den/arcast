'use client'
import Image from 'next/image'
import { Sample, ServiceType } from '@/types'
import SmoothOverlappingCarousel from '../ui/smooth-overlapping-carousel'
import ServiceTypesList from '../servicesComponents/ServiceTypesList'
import { useState, useMemo, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface EpisodeSectionProps {
  initialServiceTypes: ServiceType[]
  initialSamples: Sample[]
}

const EpisodeSection = ({
  initialServiceTypes,
  initialSamples,
}: EpisodeSectionProps) => {
  const filteredServiceTypes = useMemo(
    () =>
      initialServiceTypes.filter(
        serviceType => serviceType.samples && serviceType.samples.length > 0
      ),
    [initialServiceTypes]
  )

  // Use first available service type as default
  const firstServiceTypeSlug = useMemo(
    () => filteredServiceTypes[0]?.slug || '',
    [filteredServiceTypes]
  )

  const [typePackages, setTypePackages] = useState<string>(firstServiceTypeSlug)

  // Reset to first service type if current has no samples
  useEffect(() => {
    const currentSamples = initialSamples.filter(
      sample => sample?.serviceType?.slug === typePackages
    )
    if (currentSamples.length === 0 && firstServiceTypeSlug) {
      setTypePackages(firstServiceTypeSlug)
    }
  }, [typePackages, initialSamples, firstServiceTypeSlug])

  const filteredSamples = initialSamples.filter(sample => {
    return sample?.serviceType?.slug === typePackages
  })

  return (
    <section className="py-10 xl:py-20">
      <div className="section-title">what we&apos;ve made</div>
      <div className="flex flex-col md:flex-row justify-between gap-4 lg:mb-18 mb-10">
        <div className="mt-2">
          <h2>
            See our work in <span className="text-accent">action</span>
          </h2>
          <div className="inline-flex items-center gap-4">
            <Image
              src="/assets/images/pre-explore.png"
              alt="Explore the latest jewels"
              width={105}
              height={48}
              className="rounded-full h-12 hidden xl:block"
            />
            <h2>
              Explore the latest <span className="text-accent">jewels</span>
            </h2>
          </div>
        </div>
        <p className="text-secondary max-w-xs">
          Dive into handpicked examples of our work regarding different types of
          media and content creation.
        </p>
      </div>

      <div className="overflow-hidden lg:overflow-visible lg:flex lg:flex-row items-center gap-4">
        <div className="lg:w-1/3 w-full lg:pr-4 mb-14 lg:mb-0">
          <ServiceTypesList
            typePackages={typePackages}
            initialServiceTypes={filteredServiceTypes}
            setTypePackages={setTypePackages}
          />
        </div>

        <AnimatePresence mode="wait">
          {initialSamples && (
            <motion.div
              key={typePackages}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="relative flex-1 xl:pr-44 h-[22.5rem]"
            >
              <SmoothOverlappingCarousel
                items={filteredSamples}
                className="w-full h-full"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

export default EpisodeSection
