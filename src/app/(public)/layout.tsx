import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'

// Set revalidate to 120 seconds for production builds
export const revalidate = 120

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
