import { ServiceType } from '@/types'
import { motion } from 'framer-motion'
import ServiceButton from './ServiceButton'
import {
  serviceButtonVariants,
  serviceButtonItemVariants,
} from '@/lib/motion-variants'

interface ServiceTypesListProps {
  initialServiceTypes: ServiceType[]
  setTypePackages: (typePackages: string) => void
  typePackages: string
}

const ServiceTypesList = ({
  initialServiceTypes,
  setTypePackages,
  typePackages,
}: ServiceTypesListProps) => {
  const handleSetTypePackages = (typePackages: string) => {
    setTypePackages(typePackages)
  }

  return (
    <motion.div
      className="flex flex-col gap-4"
      variants={serviceButtonVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {initialServiceTypes &&
        initialServiceTypes.map(serviceType => (
          <motion.div key={serviceType.id} variants={serviceButtonItemVariants}>
            <ServiceButton
              title={serviceType.name}
              isActive={typePackages === serviceType.slug}
              onClick={() => handleSetTypePackages(serviceType.slug)}
            />
          </motion.div>
        ))}
    </motion.div>
  )
}

export default ServiceTypesList
