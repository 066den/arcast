import { useMemo } from 'react'
import { ServiceType } from '@/types'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel'
import { Card, CardContent } from '../ui/card'
import ServiceCard from './ServiceCard'
import { motion, AnimatePresence } from 'framer-motion'
import { cardVariants, containerVariants } from '@/lib/motion-variants'

interface ServicesCarousel {
  serviceType: ServiceType[]
  typePackages: string
}
const ServicesCarousel = ({ serviceType, typePackages }: ServicesCarousel) => {
  const services = useMemo(() => {
    const selectedType = serviceType.find(type => type.slug === typePackages)
    return selectedType?.services || []
  }, [serviceType, typePackages])

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        <Carousel
          opts={{
            align: 'start',
          }}
        >
          <CarouselContent>
            <AnimatePresence mode="popLayout">
              {services.length > 0 ? (
                services.map((service, index) => (
                  <CarouselItem key={service.id} className="basis-1/3">
                    <motion.div
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      custom={index}
                      layout
                      className="h-full"
                    >
                      <ServiceCard service={service} />
                    </motion.div>
                  </CarouselItem>
                ))
              ) : (
                <CarouselItem key={0}>
                  <Card className="h-full min-h-[300px] flex items-center justify-center bg-muted rounded-3xl font-nunito-sans">
                    <CardContent>
                      <p>No services found</p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              )}
            </AnimatePresence>
          </CarouselContent>
          {services.length > 3 && (
            <div className="absolute flex gap-5 right-0 top-0 -translate-y-[5em] z-20 ">
              <CarouselPrevious className="static" />
              <CarouselNext className="static" />
            </div>
          )}
        </Carousel>
      </AnimatePresence>
    </div>
  )
}

export default ServicesCarousel
