'use client'
import Image from 'next/image'
import { Sample, ServiceType } from '@/types'
import SmoothOverlappingCarousel from '../ui/smooth-overlapping-carousel'
import ServiceTypesList from '../servicesComponents/ServiceTypesList'
import { useState } from 'react'

interface EpisodeSectionProps {
  initialServiceTypes: ServiceType[]
  initialSamples: Sample[]
}

const EpisodeSection = ({
  initialServiceTypes,
  initialSamples,
}: EpisodeSectionProps) => {
  const [typePackages, setTypePackages] = useState<string>('podcast')
  return (
    <section className="py-10 xl:py-20">
      <div className="section-title">what we&apos;ve made</div>
      <div className="flex justify-between gap-4 mb-18">
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

      <div className="flex flex-row items-center gap-4">
        <div className="w-1/3 pr-4">
          <ServiceTypesList
            typePackages={typePackages}
            initialServiceTypes={initialServiceTypes}
            setTypePackages={setTypePackages}
          />
        </div>

        {initialSamples && (
          <SmoothOverlappingCarousel
            items={initialSamples}
            className="flex-1 xl:pr-44 h-[22.5rem]"
          />
        )}
      </div>
    </section>
  )
}

export default EpisodeSection
