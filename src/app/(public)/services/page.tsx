import HeroSection from '@/components/sections/HeroSection'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import ServicesContentList from '@/components/servicesComponents/ServicesContentList'
import servicesContent from '@/data/servicesContent.json'
import { getClients } from '@/services/studioServices'

export default async function ServicesPage() {
  const clients = await getClients()
  const services = servicesContent
  return (
    <>
      <HeroSection
        title="Services"
        description="Providing full-cycled content production services"
        image="/assets/images/services.jpg"
      />
      <ServicesContentList initialServices={services} />
      <TestimonialsSection initialClients={clients} />
    </>
  )
}
