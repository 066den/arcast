import HeroSection from '@/components/sections/HeroSection'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import { getClients } from '@/services/studioServices'

export default async function BusinessPage() {
  const clients = await getClients()
  return (
    <>
      <HeroSection
        title="For Business"
        description="Serious solutions for your new horizons"
        image="/assets/images/business-banner.webp"
      />
      <TestimonialsSection initialClients={clients} />
    </>
  )
}
