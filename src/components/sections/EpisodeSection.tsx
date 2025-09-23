'use client'
import Image from 'next/image'
import { motion } from 'framer-motion'
import ServiceButton from '../servicesPage/ServiceButton'
import { Sample, Service } from '@/types'
import SmoothOverlappingCarousel from '../ui/smooth-overlapping-carousel'
import {
  serviceButtonVariants,
  serviceButtonItemVariants,
} from '@/lib/motion-variants'

interface EpisodeSectionProps {
  initialServices: Service[]
  initialSamples: Sample[]
}

const EpisodeSection = ({
  initialServices,
  initialSamples,
}: EpisodeSectionProps) => {
  return (
    <section className="py-20">
      <div className="section-title">what we&apos;ve made</div>
      <div className="flex justify-between gap-4 mb-25">
        <div className="mt-2">
          <h2 className="text-6xl mb-4">
            See our work in <span className="text-accent">action</span>
          </h2>
          <h2 className="text-6xl flex items-center gap-3">
            <Image
              src="/assets/images/pre-explore.png"
              alt="Explore the latest jewels"
              width={105}
              height={48}
              className="rounded-full h-12"
            />
            Explore the latest <span className="text-accent">jewels</span>
          </h2>
        </div>
        <p className="text-secondary max-w-xs">
          Dive into handpicked examples of our work regarding different types of
          media and content creation.
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

        {initialSamples && <SmoothOverlappingCarousel items={initialSamples} />}
      </div>
    </section>
  )
}

export default EpisodeSection
