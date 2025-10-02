'use client'

import { useState } from 'react'
import { Button } from '../ui/button'
import { navigation } from '@/lib/config'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/constants'
import { ChevronRightIcon, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const pathname = usePathname()
  const router = useRouter()

  const handleGetStarted = () => {
    router.push(ROUTES.BOOKING)
    onClose()
  }

  const handleLinkClick = () => {
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 h-screen bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-80 max-w-[80vw] bg-white z-50 lg:hidden shadow-2xl"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between bg-white p-4 border-b">
                <h2 className="text-lg font-semibold">Menu</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="p-2"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="flex-1 p-4 bg-white">
                <ul className="space-y-2">
                  {navigation.map(item => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={handleLinkClick}
                        className={cn(
                          'block py-3 px-4 rounded-lg text-base font-medium transition-colors',
                          {
                            'bg-accent/10 text-accent': item.href === pathname,
                            'text-gray-700 hover:bg-gray-100':
                              item.href !== pathname,
                          }
                        )}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="px-4 py-6 border-t bg-white">
                <Button
                  size="lg"
                  variant="primary"
                  icon={<ChevronRightIcon className="size-5" />}
                  className="w-full group"
                  onClick={handleGetStarted}
                >
                  Get started
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default MobileMenu
