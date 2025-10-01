'use client'

import { useMemo, useRef } from 'react'
import Video from 'next-video'
import Image from 'next/image'
import { Button } from '../ui/button'
import { ChevronRightIcon } from 'lucide-react'
import { Carousel, CarouselContent, CarouselItem } from '../ui/carousel'
import { Client } from '@/types'
import { motion } from 'framer-motion'
import {
  containerVariants,
  itemVariants,
  textVariants,
} from '@/lib/motion-variants'
import Autoplay from 'embla-carousel-autoplay'
import videoUrl from 'https://res.cloudinary.com/deuvbiekl/video/upload/v1747050640/1_sngfk4.mp4'

interface TestimonialsSectionProps {
  isVideo?: boolean
  initialClients: Client[]
}

const TestimonialsSection = ({
  isVideo,
  initialClients,
}: TestimonialsSectionProps) => {
  const autoplayPlugin = useRef(
    Autoplay({
      delay: 2000,
    })
  )

  const clientTestimonials = useMemo(() => {
    if (!initialClients) return []
    return initialClients.filter(
      client => client.testimonial && client.featured
    )
  }, [initialClients])

  // Safe handlers for mouse events
  const handleMouseEnter = () => {
    if (autoplayPlugin.current) {
      autoplayPlugin.current.stop()
    }
  }

  const handleMouseLeave = () => {
    if (autoplayPlugin.current) {
      autoplayPlugin.current.play()
    }
  }

  return (
    <motion.section
      className="lg:py-20 py-10"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
    >
      <div className="grid grid-cols-5 md:gap-10 gap-2">
        <div className="aspect-[3/4] md:col-span-2 col-span-1 md:max-w-xl rounded-3xl overflow-hidden">
          {isVideo ? (
            <Video
              src={videoUrl ?? ''}
              controls={false}
              className="rounded-3xl"
              muted
              loop
              autoPlay
              playsInline
              //poster={poster}
            />
          ) : (
            <Image
              src="/assets/images/testimonial-poster.webp"
              alt="Testimonials"
              width={600}
              height={740}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <motion.div
          variants={containerVariants}
          className="md:col-span-3 col-span-4 px-6"
        >
          <motion.div className="section-title" variants={itemVariants}>
            FREE YOURSELF FROM PRODUCTION ROUTINE
          </motion.div>
          <motion.h2
            className="leading-tight max-w-2xl mb-4"
            variants={textVariants}
          >
            This is how we&apos;ve <br /> already helped talents like you!
          </motion.h2>
          <motion.div variants={itemVariants}>
            <Button
              size="lg"
              variant="primary"
              className="group"
              icon={<ChevronRightIcon className="size-7" />}
            >
              Check our cases
            </Button>
          </motion.div>
          <motion.div
            className="border-b font-medium my-10 py-2.5"
            variants={itemVariants}
          >
            Hear what our clients say
          </motion.div>
          <motion.div variants={containerVariants}>
            <Carousel
              plugins={[autoplayPlugin.current]}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              opts={{
                align: 'start',
                skipSnaps: false,
                dragFree: false,
              }}
            >
              <CarouselContent className="-mr-2">
                {clientTestimonials.map((client, index) => (
                  <CarouselItem
                    key={client.id}
                    className="xl:basis-1/2 border-e-2 px-6"
                  >
                    <motion.div variants={itemVariants} custom={index}>
                      <blockquote className="text-xl font-nunito-sans font-medium mb-6">{`"${client.testimonial}"`}</blockquote>
                      <div className="text-secondary">{`- ${client.name}, ${client.showTitle ? `${client.jobTitle} of ${client.showTitle}` : ''}`}</div>
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  )
}

export default TestimonialsSection
