import HeroSection from '@/components/sections/HeroSection'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import { getClients } from '@/services/studioServices'

export default async function AboutPage() {
  const clients = await getClients()

  return (
    <>
      <HeroSection
        title="About Us"
        description="Who we are and what can we do for you"
        image="/assets/images/about-banner.webp"
      />
      <TestimonialsSection initialClients={clients} />
    </>
  )
}
