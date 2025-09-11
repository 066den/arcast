'use client'

import { Button } from '../ui/button'
import Image from 'next/image'
import { navigation, siteConfig } from '@/lib/config'
import Link from 'next/link'
import { ChevronRightIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'

const Header = () => {
  const pathname = usePathname()
  return (
    <header className="top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-xs dark:bg-slate-900/80">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 md:space-x-16">
            <Link href="/" className="text-xl font-bold">
              <Image
                src="/icons/logo-dark.svg"
                alt={siteConfig.name}
                width={140}
                height={40}
              />
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              {navigation.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors',
                    {
                      'text-slate-900 dark:text-white': item.href === pathname,
                    }
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <Button size="md" className="group">
            Book Your Session
            <ChevronRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200 ease-in-out" />
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header
