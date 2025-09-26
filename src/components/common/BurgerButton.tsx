'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface BurgerButtonProps {
  isOpen: boolean
  onClick: () => void
  className?: string
}

const BurgerButton = ({ isOpen, onClick, className }: BurgerButtonProps) => {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'flex flex-col justify-center items-center w-8 h-8 space-y-1.5 p-1',
        'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded-md',
        className
      )}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      whileTap={{ scale: 0.95 }}
    >
      <motion.span
        className="block w-6 h-0.5 bg-gray-700 rounded-full"
        animate={{
          rotate: isOpen ? 45 : 0,
          y: isOpen ? 6 : 0,
        }}
        transition={{ duration: 0.2 }}
      />
      <motion.span
        className="block w-6 h-0.5 bg-gray-700 rounded-full"
        animate={{
          opacity: isOpen ? 0 : 1,
        }}
        transition={{ duration: 0.2 }}
      />
      <motion.span
        className="block w-6 h-0.5 bg-gray-700 rounded-full"
        animate={{
          rotate: isOpen ? -45 : 0,
          y: isOpen ? -6 : 0,
        }}
        transition={{ duration: 0.2 }}
      />
    </motion.button>
  )
}

export default BurgerButton
