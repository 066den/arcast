import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { seoConfig } from '@/lib/config'
import { Toaster } from '@/components/ui/sonner'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const { title, description } = seoConfig

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'Next.js',
    'React',
    'Tailwind CSS',
    'shadcn/ui',
    'TypeScript',
    'Web Development',
  ],
  openGraph: {
    title: 'ARcast Official Website',
    description: description,
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ARcast Official Website',
    description: description,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
