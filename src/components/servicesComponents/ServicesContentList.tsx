'use client'
import ServiceContent from './ServiceContent'
import { motion } from 'framer-motion'
import { containerVariants } from '@/lib/motion-variants'
import { ServiceType } from '@/types'

interface ServicesContentListProps {
  servicesTypes: ServiceType[]
  servicesDescription: {
    id: string
    title: string
    serviceType: string
    description: string
    content: string
    imageUrl: string
  }[]
}

const ServicesContentList = ({
  servicesDescription,
  servicesTypes,
}: ServicesContentListProps) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
    >
      {servicesDescription.map((service, index) => (
        <ServiceContent
          key={service.id}
          service={service}
          servicesTypes={servicesTypes}
          index={index}
        />
      ))}
    </motion.div>
  )
}

export default ServicesContentList
