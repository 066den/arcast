'use client'

import type React from 'react'

import { motion, type Variants } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useState, useEffect, useRef } from 'react'

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
  const [contentWidth, setContentWidth] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const measureWidth = () => {
      if (contentRef.current) {
        const firstChild = contentRef.current.firstElementChild as HTMLElement
        if (firstChild) {
          setContentWidth(firstChild.offsetWidth)
        }
      }
    }

    measureWidth()

    const resizeObserver = new ResizeObserver(measureWidth)
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [children])

  const duration = contentWidth > 0 ? contentWidth / speed : 10

  const marqueeVariants: Variants = {
    animate: {
      x: direction === 'left' ? [0, -contentWidth] : [0, contentWidth],
      transition: {
        x: {
          repeat: Number.POSITIVE_INFINITY,
          repeatType: 'loop',
          duration: duration,
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
        ref={contentRef}
        className="flex"
        animate={isHovered ? {} : 'animate'}
        variants={marqueeVariants}
        style={{ willChange: 'transform' }}
      >
        <div className={className}>{children}</div>
        <div className={className}>{children}</div>
      </motion.div>
    </div>
  )
}

export default Marquee
