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
    <header className="sticky top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-xs dark:bg-slate-900/80">
      <div className="px-4 xl:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center px-4 space-x-4 md:space-x-16">
          <Link href="/" className="text-xl font-bold">
            <Image
              src="/icons/logo-dark.svg"
              alt={siteConfig.name}
              width={140}
              height={40}
            />
          </Link>
          <nav className="hidden md:flex items-center space-x-4">
            {navigation.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'py-2 px-4 tracking-[-0.02em] font-nunito-sans hover:text-accent dark:text-slate-300 dark:hover:text-white transition-colors',
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

        <Button
          size="lg"
          variant="primary"
          icon={<ChevronRightIcon className="size-7" />}
          className="group"
        >
          Get started
        </Button>
      </div>
    </header>
  )
}

export default Header
