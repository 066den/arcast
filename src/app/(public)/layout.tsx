import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'

// Set revalidate based on environment: 0 for development, 120 for production
export const revalidate = process.env.NODE_ENV === 'development' ? 0 : 120

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )
}
