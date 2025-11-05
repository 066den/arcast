'use client'
import Headline from '../common/Headline'
import ReactMarkdown from 'react-markdown'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { containerVariants, itemVariants } from '@/lib/motion-variants'
import remarkBreaks from 'remark-breaks'
import { ROUTES } from '@/lib/constants'
import {
  SCROLL_TARGETS,
  useScrollNavigation,
} from '@/hooks/useScrollNavigation'

import { Button } from '../ui/button'
import { ChevronRightIcon, Play } from 'lucide-react'
import { Sample, ServiceType } from '@/types'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '../ui/carousel'
import { cn } from '@/lib/utils'
import { useCallback, useState } from 'react'
import { VideoModal } from '../modals/modal'
import useFlag from '@/hooks/useFlag'
import { useBooking } from '@/hooks/storeHooks/useBooking'

interface ServiceContentProps {
  servicesTypes: ServiceType[]
  service: {
    id: string
    title: string
    serviceType: string
    description: string
    content: string
    imageUrl: string
  }
  index: number
}

const ServiceContent = ({
  service,
  index,
  servicesTypes,
}: ServiceContentProps) => {
  const { title, description, content, imageUrl, serviceType } = service

  const { navigateWithScroll } = useScrollNavigation()

  const [selectedSample, setSelectedSample] = useState<Sample | null>(null)
  const [isVideoModalOpen, videoOpen, videoClose] = useFlag()

  const serviceSamples =
    servicesTypes && servicesTypes.find(st => st.slug === serviceType)?.samples

  const { selectServiceType } = useBooking()

  const handleBookNow = (typePackages: string) => {
    selectServiceType(typePackages)
    navigateWithScroll(ROUTES.BOOKING, SCROLL_TARGETS.BOOKING.SERVICES)
  }

  const actionSection = () => {
    const shortServiceType = serviceType.split('-')[0]
    switch (shortServiceType) {
      case 'podcast':
        return { label: 'Fire up your Podcast' }
      case 'reels':
        return { label: 'Reach your Viewers' }
      case 'media':
        return { label: 'Let us call George Lucas' }
      case 'social':
        return { label: 'Reach your Viewers' }
      default:
        return { label: 'Book Now' }
    }
  }

  const handlePlayVideo = useCallback(
    (sample: Sample) => {
      if (sample.videoUrl) {
        setSelectedSample(sample)
        videoOpen()
      }
    },
    [videoOpen, setSelectedSample]
  )

  return (
    <motion.section
      className="lg:py-10 py-6 space-y-8"
      id={
        index === 0
          ? 'full-cycle'
          : index === 1
            ? 'reels'
            : index === 2
              ? 'media'
              : ''
      }
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
    >
      <motion.div variants={itemVariants}>
        <Headline
          isReverse={index % 2 !== 0}
          title={title ?? ''}
          description={description ?? ''}
          image={imageUrl ?? ''}
          actionSection={[
            {
              label: actionSection().label,
              event: () => handleBookNow(serviceType),
            },
          ]}
        />
      </motion.div>
      {content && (
        <motion.div
          variants={itemVariants}
          className="text-content blog-text-content"
        >
          <ReactMarkdown remarkPlugins={[remarkBreaks]}>
            {content}
          </ReactMarkdown>
        </motion.div>
      )}
      {serviceSamples && serviceSamples.length > 0 && (
        <div className="space-y-10">
          <h2 className="text-accent">{`Some ${serviceType} examples`}</h2>

          <Carousel opts={{ align: 'start', loop: true }}>
            <CarouselContent>
              {serviceSamples.map(sample => (
                <CarouselItem
                  key={sample.id}
                  className="sm:basis-1/2 lg:basis-1/3 2xl:aspect-video sm:aspect-[4/3] aspect-video md:pl-6 relative"
                >
                  <Image
                    src={sample.thumbUrl ?? ''}
                    alt={sample.name ?? ''}
                    width={425}
                    height={425}
                    className="rounded-3xl w-full h-full object-cover"
                  />
                  <div className="absolute group z-10 inset-0 flex items-center justify-center">
                    <div
                      className={cn(
                        'w-20 h-20 bg-white/80 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all duration-500 ease-in-out group-hover:bg-white'
                      )}
                      onClick={() => handlePlayVideo(sample)}
                    >
                      <Play
                        className="text-black ml-1 size-8"
                        fill="currentColor"
                      />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div
              className={cn(
                'absolute gap-5 right-0 top-0 z-20 flex',
                'sm:-translate-y-[5em] -translate-y-[3em]',
                serviceSamples.length < 4 && '2xl:hidden'
              )}
            >
              <CarouselPrevious className="static translate-none hidden sm:flex" />
              <CarouselNext className="static translate-none hidden sm:flex" />
            </div>
            <CarouselPrevious className="sm:hidden translate-x-14" />
            <CarouselNext className="sm:hidden -translate-x-14" />
          </Carousel>

          <Button
            onClick={() => handleBookNow(serviceType)}
            size="lg"
            variant="primary"
            className="group"
            icon={<ChevronRightIcon className="size-7" />}
          >
            {actionSection().label}
          </Button>
        </div>
      )}
      {selectedSample && (
        <VideoModal
          isOpen={isVideoModalOpen}
          title={selectedSample.name || ''}
          videoUrl={selectedSample.videoUrl || ''}
          poster={selectedSample.thumbUrl || undefined}
          onClose={videoClose}
        />
      )}
    </motion.section>
  )
}

export default ServiceContent
