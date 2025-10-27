import { useMemo } from 'react'
import { PackageWithServices, ServiceType } from '@/types'
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
import { cardVariants } from '@/lib/motion-variants'
import PackageCard from './PackageCard'
import { useBooking } from '@/hooks/storeHooks/useBooking'
import { cn } from '@/lib/utils'

interface ServicesCarousel {
  serviceType: ServiceType[]
  packages: PackageWithServices[]
  typePackages: string
  isBooking?: boolean
}
const ServicesCarousel = ({
  serviceType,
  typePackages,
  packages,
  isBooking = false,
}: ServicesCarousel) => {
  const { selectServiceTypeSlug } = useBooking()
  const services = useMemo(() => {
    const selectedType = serviceType.find(type =>
      isBooking
        ? type.slug === selectServiceTypeSlug
        : type.slug === typePackages
    )
    return selectedType?.services || []
  }, [serviceType, typePackages, isBooking, selectServiceTypeSlug])

  return (
    <div className="w-full">
      <Carousel
        opts={{
          align: 'start',
        }}
      >
        <CarouselContent
          className={cn(
            'w-full justify-start',
            isBooking ? 'lg:justify-center' : '2xl:justify-center'
          )}
        >
          <AnimatePresence mode="popLayout">
            {services.length > 0 ? (
              services.map((service, index) => (
                <CarouselItem
                  key={service.id}
                  className="max-w-[280px] lg:max-w-[300px] 2xl:max-w-[325px]"
                >
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
            ) : packages.length > 0 &&
              (isBooking
                ? selectServiceTypeSlug === 'beneficial-packages'
                : typePackages === 'beneficial-packages') ? (
              packages.map(packageData => (
                <CarouselItem
                  key={packageData.id}
                  className="max-w-[280px] lg:max-w-[300px] 2xl:max-w-[325px]"
                >
                  <PackageCard package={packageData} />
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

        <div
          className={cn(
            'absolute gap-5 right-0 top-0 z-20 hidden lg:flex',
            isBooking ? 'lg:-translate-y-[4em]' : 'lg:-translate-y-[5em]',
            (services.length < 4 || packages.length < 4) && '2xl:hidden'
          )}
        >
          <CarouselPrevious className="static translate-none" />
          <CarouselNext className="static translate-none" />
        </div>
      </Carousel>
    </div>
  )
}

export default ServicesCarousel
