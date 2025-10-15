import {
  Book,
  Box,
  Calendar,
  Radio,
  Settings,
  Wrench,
  Users,
} from 'lucide-react'
import { ROUTES } from './constants'

export const siteConfig = {
  name: 'ARcast',
  description:
    'Professional podcast studio booking platform with state-of-the-art equipment and flexible scheduling.',
  url: 'https://arcast.com',
  ogImage: 'https://arcast.com/og.jpg',
  links: {
    twitter: 'https://twitter.com/arcast',
    github: 'https://github.com/arcast',
    instagram: 'https://instagram.com/arcast',
    linkedin: 'https://linkedin.com/company/arcast',
  },
  contact: {
    email: 'info@arcast.com',
    phone: '+971 50 824 9795',
    whatsapp: '+971 50 824 9795',
    address: 'Dubai, UAE',
    bookingEmail: 'booking@arcast.studio',
  },
} as const

export const navigation = [
  { name: 'Services', href: ROUTES.SERVICES },
  { name: 'Case Studies', href: ROUTES.CASE_STUDIES },
  { name: 'Content Factory', href: ROUTES.CONTENT_FACTORY },
  { name: 'Blog', href: ROUTES.BLOG },
  { name: 'About Us', href: ROUTES.ABOUT_US },
  { name: 'Our Setups', href: ROUTES.OUR_SETUPS },
  { name: 'For Business', href: ROUTES.FOR_BUSINESS },
] as const

export const adminNavigation = [
  { name: 'Bookings', href: ROUTES.ADMIN, icon: Calendar },
  { name: 'Studios', href: ROUTES.ADMIN + '/studios', icon: Radio },
  { name: 'Services', href: ROUTES.ADMIN + '/services', icon: Box },
  { name: 'Equipment', href: ROUTES.ADMIN + '/equipment', icon: Wrench },
  { name: 'Staff', href: ROUTES.ADMIN + '/staff', icon: Users },
  { name: 'Blog', href: ROUTES.ADMIN + '/blog', icon: Book },
  { name: 'Settings', href: ROUTES.ADMIN + '/settings', icon: Settings },
] as const

export const legalNavigation = [
  { name: 'Terms of Service', href: '/terms-of-service' },
  { name: 'Privacy Policy', href: '/privacy-policy' },
  { name: 'Data Deletion', href: '/data-deletion' },
] as const

export const supportNavigation = [
  { name: 'Contact Us', href: '/contact-us' },
] as const

export const aboutFeatures = [
  {
    title: 'Full-cycle production',
    description:
      'Conversations that break the surface and explore what really matters. Episodes that spark thoughts and challenge perspectives.',
    image: '/assets/images/production.webp',
    url: '/services#full-cycle',
  },
  {
    title: 'Strategy & competitor analysis',
    description:
      'Conversations that break the surface and explore what really matters. Episodes that spark thoughts and challenge perspectives.',
    image: '/assets/images/strategy.webp',
    url: '/services#reels',
  },
  {
    title: 'Publishing & growth support',
    description:
      'Conversations that break the surface and explore what really matters. Episodes that spark thoughts and challenge perspectives.',
    image: '/assets/images/publishing.webp',
    url: '/services#media',
  },
] as const

export const socialLinks = [
  {
    platform: 'Instagram',
    url: 'https://instagram.com/arcast',
    icon: 'instagram',
  },
  {
    platform: 'Twitter',
    url: 'https://twitter.com/arcast',
    icon: 'twitter',
  },
  {
    platform: 'LinkedIn',
    url: 'https://linkedin.com/company/arcast',
    icon: 'linkedin',
  },
  {
    platform: 'YouTube',
    url: 'https://youtube.com/@arcast',
    icon: 'youtube',
  },
] as const

export const seoConfig = {
  title: 'Arcast - Professional Podcast Studio in Dubai',
  description:
    'Book professional podcast recording studios in Dubai. State-of-the-art equipment, flexible scheduling, and expert support for your podcast production needs.',
  keywords: [
    'podcast studio Dubai',
    'podcast recording',
    'audio production',
    'professional microphones',
    'studio rental',
    'podcast equipment',
    'sound recording',
    'podcast production',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: 'Professional Podcast Studio | Arcast Dubai',
    description:
      'Premium podcast recording facilities with professional equipment and flexible booking. Perfect for podcasters, content creators, and businesses.',
    images: [
      {
        url: `${siteConfig.url}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Arcast Podcast Studio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@arcast',
    creator: '@arcast',
  },
} as const

// Export types for TypeScript
export type NavigationItem = (typeof navigation)[number]
export type AboutFeature = (typeof aboutFeatures)[number]
export type SocialLink = (typeof socialLinks)[number]

// Default export for convenience
export default {
  siteConfig,
  navigation,
  aboutFeatures,
  socialLinks,
  seoConfig,
} as const
