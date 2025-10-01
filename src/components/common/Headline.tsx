'use client'

import Image from 'next/image'
import { Button } from '../ui/button'
import { ChevronRightIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import ReactHtmlParser from 'html-react-parser'

interface HeadlineProps {
  title: string
  description: string
  image: string
  isReverse?: boolean
  actionSection: { label: string; event: () => void }[]
}

const Headline = ({
  title,
  description,
  image,
  isReverse = false,
  actionSection,
}: HeadlineProps) => {
  return (
    <div
      className={cn('flex gap-10 lg:py-8 py-4', {
        'lg:flex-row-reverse': isReverse,
      })}
    >
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="aspect-[4/5] w-full max-w-[280px] overflow-hidden rounded-[2.5rem] relative"
      >
        {image && (
          <Image src={image} alt={title} fill className="object-cover" />
        )}
      </motion.div>

      <div className="flex-1 flex flex-col justify-between gap-8 pb-2">
        <motion.h2
          className=" text-accent"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
        >
          {ReactHtmlParser(title)}
        </motion.h2>

        <motion.div
          className="colored-text"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4, ease: 'easeOut' }}
        >
          {ReactHtmlParser(description)}
        </motion.div>

        <motion.div
          className="flex gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6, ease: 'easeOut' }}
        >
          {actionSection.map(({ label, event }, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.4,
                delay: 0.8 + index * 0.1,
                ease: 'easeOut',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={event}
                size="lg"
                variant="primary"
                className="group"
                icon={<ChevronRightIcon className="size-7" />}
              >
                {label}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export default Headline
