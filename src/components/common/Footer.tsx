'use client'
import Image from 'next/image'
import { Button } from '../ui/button'
import { ArrowIcon } from '../ui/icons'
import {
  legalNavigation,
  navigation,
  siteConfig,
  supportNavigation,
} from '@/lib/config'
import Link from 'next/link'
import useFlag from '@/hooks/useFlag'
import ContactForm from './ContactForm'

const Footer = () => {
  const [isContactFormOpen, contactFormOpen, contactFormClose] = useFlag()
  return (
    <footer>
      <section className="flex flex-col sm:flex-row lg:gap-14 gap-6 lg:pb-20 pb-10">
        <div className="aspect-[16/9] md:w-3/5 rounded-3xl overflow-hidden hover:bg-black/10 transition-all duration-300 relative group">
          <Image
            src="/assets/images/map-Dubai.jpg"
            alt="Map Location"
            width={750}
            height={400}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="text-white text-center">
              View location & direction
            </div>
          </div>
        </div>
        <div className="w-full md:w-2/5">
          <div className="flex items-center justify-between gap-2 pb-5">
            <h3>Reach us out</h3>
            <Button
              variant="accent"
              size="icon"
              className="size-15"
              onClick={contactFormOpen}
            >
              <ArrowIcon size={28} degree={-45} className="stroke-white" />
            </Button>
          </div>
          <div className="flex justify-between border-t pt-10 gap-2">
            <nav className="flex flex-col gap-2">
              <p className="font-medium mb-2">{siteConfig.name}</p>
              {navigation.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-secondary hover:text-primary transition-all duration-300"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <nav className="flex flex-col gap-2">
              <p className="font-medium mb-2">Legal</p>
              {legalNavigation.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-secondary hover:text-primary transition-all duration-300"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <nav className="flex flex-col gap-2">
              <p className="font-medium mb-2">Support</p>

              <span
                onClick={contactFormOpen}
                className="text-secondary hover:text-primary transition-all duration-300 cursor-pointer"
              >
                Contact us
              </span>
            </nav>
          </div>
        </div>
      </section>
      <div className="border-t lg:py-10 py-6">
        <section className="flex justify-between">
          <p>© 2025 ARcast All rights reserved.</p>
        </section>
      </div>
      <ContactForm isOpen={isContactFormOpen} onClose={contactFormClose} />
    </footer>
  )
}

export default Footer
