'use client'

import Image from 'next/image'
import { Button } from '../ui/button'
import { ChevronRightIcon } from 'lucide-react'
import remarkBreaks from 'remark-breaks'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'

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
      className={cn('flex gap-10 py-14', {
        'lg:flex-row-reverse': isReverse,
      })}
    >
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="max-w-[280px] max-h-[350px]"
      >
        {image && (
          <Image
            src={image}
            alt={title}
            width={280}
            height={350}
            className="rounded-[2.5rem] h-full object-cover w-full"
          />
        )}
      </motion.div>

      <div className="flex-1 flex flex-col justify-between gap-8 pb-2">
        <motion.h2
          className=" text-accent"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
        >
          {title}
        </motion.h2>

        <motion.h3
          className="colored-text"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4, ease: 'easeOut' }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkBreaks]}
            components={{
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              p: ({ node, ...props }) => <span {...props} />,
            }}
          >
            {description}
          </ReactMarkdown>
        </motion.h3>

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
