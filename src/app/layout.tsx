import type { Metadata } from 'next'
import { Hanken_Grotesk, Nunito_Sans } from 'next/font/google'
import { seoConfig } from '@/lib/config'
import { Toaster } from '@/components/ui/sonner'

import './globals.css'

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-hanken-grotesk',
  display: 'swap',
})
const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-nunito-sans',
  display: 'swap',
})
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
    <html
      lang="en"
      className={`${hankenGrotesk.variable} ${nunitoSans.variable}`}
    >
      <head>
        <link
          rel="preload"
          as="image"
          href="/icons/logo-dark.svg"
          type="image/svg+xml"
        />
      </head>
      <body className={nunitoSans.className}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
