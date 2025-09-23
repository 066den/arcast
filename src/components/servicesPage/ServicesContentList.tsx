'use client'
import ServiceContent from './ServiceContent'
import { motion } from 'framer-motion'
import { containerVariants } from '@/lib/motion-variants'

interface ServicesContentListProps {
  initialServices: {
    id: string
    title: string
    description: string
    content: string
    imageUrl: string
  }[]
}

const ServicesContentList = ({ initialServices }: ServicesContentListProps) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
    >
      {initialServices.map((service, index) => (
        <ServiceContent key={service.id} service={service} index={index} />
      ))}
    </motion.div>
  )
}

export default ServicesContentList
