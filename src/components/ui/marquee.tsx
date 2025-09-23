'use client'

import { motion, Variants } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface MarqueeProps {
  children: React.ReactNode
  contentClassName?: string
  className?: string
  direction?: 'left' | 'right'
  speed?: number
  pauseOnHover?: boolean
}

const Marquee = ({
  children,
  contentClassName,
  className,
  direction = 'left',
  speed = 50,
  pauseOnHover = false,
}: MarqueeProps) => {
  const [isHovered, setIsHovered] = useState(false)

  const marqueeVariants = {
    animate: {
      x: [0, '-100%'],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: 'loop',
          duration: 10,
          ease: 'linear',
        },
      },
    },
  }

  const handleMouseEnter = () => {
    if (pauseOnHover) {
      setIsHovered(true)
    }
  }

  const handleMouseLeave = () => {
    if (pauseOnHover) {
      setIsHovered(false)
    }
  }

  return (
    <div
      className={cn('overflow-hidden whitespace-nowrap', contentClassName)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="flex gap-10"
        animate={isHovered ? {} : 'animate'}
        variants={marqueeVariants as Variants}
      >
        <span className={className}> {children} </span>
        <span className={className}>{children} </span>
        <span className={className}>{children} </span>
      </motion.div>
    </div>
  )
}

export default Marquee
