'use client'
import Image from 'next/image'
import { siteConfig } from '@/lib/config'

// Optimized Hero Background Component
export default function HeroBackground() {
  return (
    <div className="absolute inset-0 z-0">
      <Image
        src="/assets/images/hero-bg.webp"
        alt={siteConfig.name}
        fill
        priority
        quality={90}
        className="object-cover object-center image-loading-optimized"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        sizes="100vw"
        onLoad={e => {
          // Add loaded class for smooth transition
          const target = e.target as HTMLImageElement
          target.classList.add('loaded')
        }}
      />
      {/* Fallback gradient overlay */}
      <div className="absolute inset-0 hero-background" />
    </div>
  )
}
