import type { Metadata } from 'next'
import { Hanken_Grotesk, Nunito_Sans, Geist } from 'next/font/google'
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
const geist = Geist({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-geist',
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
      className={`${hankenGrotesk.variable} ${nunitoSans.variable} ${geist.variable}`}
    >
      <head>
        <link
          rel="preload"
          as="image"
          href="/icons/logo-dark.svg"
          type="image/svg+xml"
        />
        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '982289293294357');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=982289293294357&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}
      </head>
      <body className={geist.className}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
