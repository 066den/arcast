import { Button } from '../ui/button'
import Image from 'next/image'
import { navigation, siteConfig } from '@/lib/config'
import Link from 'next/link'

const Header = () => {
  return (
    <header className="top-0 left-0 right-0 z-50 border-b bg-transparent backdrop-blur-xs dark:bg-slate-900/80">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/" className="text-xl font-bold">
              <Image
                src="/icons/logo-dark.svg"
                alt={siteConfig.name}
                width={140}
                height={40}
              />
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <Button size="md" className="hidden sm:inline-flex">
            Book Your Session
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header
