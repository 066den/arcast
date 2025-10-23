import { ServiceType } from '@/types'
import { motion } from 'framer-motion'
import ServiceButton from './ServiceButton'
import {
  serviceButtonVariants,
  serviceButtonItemVariants,
} from '@/lib/motion-variants'
import { cn } from '@/lib/utils'
import { useBooking } from '@/hooks/storeHooks/useBooking'

interface ServiceTypesListProps {
  initialServiceTypes: ServiceType[]
  setTypePackages: (typePackages: string) => void
  typePackages: string
  withBenefits?: boolean
  isBooking?: boolean
}

const ServiceTypesList = ({
  initialServiceTypes,
  setTypePackages,
  typePackages,
  withBenefits = false,
  isBooking = false,
}: ServiceTypesListProps) => {
  const { selectServiceType, selectServiceTypeSlug } = useBooking()
  const handleSetTypePackages = (typePackages: string) => {
    setTypePackages(typePackages)
    selectServiceType(typePackages)
  }

  return (
    <motion.div
      className={cn(
        'flex justify-center gap-2 xl:gap-5',
        isBooking ? 'flex-row flex-wrap' : 'lg:flex-col flex-wrap'
      )}
      variants={serviceButtonVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {initialServiceTypes &&
        initialServiceTypes.map(serviceType => (
          <motion.div
            key={serviceType.id}
            variants={serviceButtonItemVariants}
            className="flex-1"
          >
            <ServiceButton
              title={serviceType.name}
              isActive={
                isBooking
                  ? selectServiceTypeSlug === serviceType.slug
                  : typePackages === serviceType.slug
              }
              isHorizontal={isBooking}
              onClick={() => handleSetTypePackages(serviceType.slug)}
            />
          </motion.div>
        ))}
      {withBenefits && (
        <motion.div
          key={'benefits'}
          variants={serviceButtonItemVariants}
          className="flex-1"
        >
          <ServiceButton
            title="Beneficial packages"
            isActive={
              isBooking
                ? selectServiceTypeSlug === 'beneficial'
                : typePackages === 'beneficial'
            }
            isHorizontal={isBooking}
            onClick={() => handleSetTypePackages('beneficial')}
          />
        </motion.div>
      )}
    </motion.div>
  )
}

export default ServiceTypesList
