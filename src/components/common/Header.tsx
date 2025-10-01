'use client'

import { useState } from 'react'
import { Button } from '../ui/button'
import Image from 'next/image'
import { navigation, siteConfig } from '@/lib/config'
import Link from 'next/link'
import { ChevronRightIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/constants'
import BurgerButton from '../ui/BurgerButton'
import MobileMenu from './MobileMenu'

const Header = () => {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleGetStarted = () => {
    router.push(ROUTES.BOOKING)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xs">
      <div className="px-2 xl:px-8 py-2 xl:py-3 flex items-center justify-between">
        <div className="flex items-center px-4 space-x-4 xl:space-x-16">
          <Link href="/" className="text-xl font-bold">
            <Image
              src="/icons/logo-dark.svg"
              alt={siteConfig.name}
              width={140}
              height={40}
            />
          </Link>
          <nav className="hidden lg:flex items-center space-x-4">
            {navigation.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'py-2 px-2 xl:px-4 tracking-[-0.02em] font-nunito-sans hover:text-accent transition-colors',
                  {
                    'underline underline-offset-4 decoration-accent decoration-2':
                      item.href === pathname,
                  }
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center">
          <Button
            size="lg"
            variant="primary"
            icon={<ChevronRightIcon className="size-7" />}
            className="hidden lg:flex group"
            onClick={handleGetStarted}
          >
            Get started
          </Button>

          <BurgerButton
            isOpen={isMobileMenuOpen}
            onClick={toggleMobileMenu}
            className="lg:hidden mr-4"
          />
        </div>
      </div>

      <MobileMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
    </header>
  )
}

export default Header
