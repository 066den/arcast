import HeroSection from '@/components/sections/HeroSection'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import ServicesContentList from '@/components/servicesComponents/ServicesContentList'
import servicesContent from '@/data/servicesContent.json'

import { getClients } from '@/services/studioServices'
import { getServiceTypes } from '@/services/servicesServices'

export default async function ServicesPage() {
  const clients = await getClients()
  const servicesTypes = await getServiceTypes()

  return (
    <>
      <HeroSection
        title="Services"
        description="Providing full-cycled content production services"
        image="/assets/images/services.jpg"
      />
      <ServicesContentList
        servicesDescription={servicesContent}
        servicesTypes={servicesTypes}
      />
      <TestimonialsSection initialClients={clients} />
    </>
  )
}
