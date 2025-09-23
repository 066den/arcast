'use client'
import Headline from '../common/Headline'
import ReactMarkdown from 'react-markdown'
import { motion } from 'framer-motion'
import { containerVariants, itemVariants } from '@/lib/motion-variants'
import remarkBreaks from 'remark-breaks'

interface ServiceContentProps {
  service: {
    id: string
    title: string
    description: string
    content: string
    imageUrl: string
  }
  index: number
}

const ServiceContent = ({ service, index }: ServiceContentProps) => {
  const { title, description, content, imageUrl } = service

  const actionSection = () => {
    switch (index) {
      case 0:
        return [
          {
            label: 'Fire up your Podcast',
            event: () => {
              console.log('Book Now')
            },
          },
        ]
      case 1:
        return [
          {
            label: 'Reach your Viewers',
            event: () => {
              console.log('Book Now')
            },
          },
        ]
      case 2:
        return [
          {
            label: 'Let us call George Lucas',
            event: () => {
              console.log('Book Now')
            },
          },
        ]
      case 3:
        return [
          {
            label: 'Reach your Viewers',
            event: () => {
              console.log('Book Now')
            },
          },
        ]
      default:
        return [
          {
            label: 'Book Now',
            event: () => {
              console.log('Book Now')
            },
          },
        ]
    }
  }

  return (
    <motion.section
      className="py-8"
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
          actionSection={actionSection()}
        />
      </motion.div>

      {content && (
        <motion.div
          variants={itemVariants}
          className="text-[2em] font-medium font-nunito-sans pt-12 text-content"
        >
          <ReactMarkdown remarkPlugins={[remarkBreaks]}>
            {content}
          </ReactMarkdown>
        </motion.div>
      )}
    </motion.section>
  )
}

export default ServiceContent
