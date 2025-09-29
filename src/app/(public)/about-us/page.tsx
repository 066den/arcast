import HeroSection from '@/components/sections/HeroSection'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import {
  getClients,
  getStudios,
  getStaff,
  getEquipment,
} from '@/services/studioServices'
import StudiosSection from '@/components/sections/StudiosSection'
import ItemCard from '@/components/common/ItemCard'
import { CaseStudyEquipment, CaseStudyStaff } from '@/types'

export default async function AboutPage() {
  const [clients, studios, staff, equipment] = await Promise.allSettled([
    getClients(),
    getStudios(),
    getStaff(),
    getEquipment(),
  ])

  return (
    <>
      <HeroSection
        title="About Us"
        description="Who we are and what can we do for you"
        image="/assets/images/about-banner.webp"
      />
      <StudiosSection
        initialStudios={studios.status === 'fulfilled' ? studios.value : []}
      />
      {staff.status === 'fulfilled' && staff.value.length > 0 && (
        <section className="py-12">
          <h2 className="text-accent mb-6">Our talent support team</h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {staff.value?.map(
              ({ id, name, role, imageUrl }: CaseStudyStaff) => (
                <ItemCard
                  key={id}
                  name={name}
                  description={role}
                  imageUrl={imageUrl}
                />
              )
            )}
          </div>
        </section>
      )}

      {equipment.status === 'fulfilled' && equipment.value.length > 0 && (
        <section className="py-12">
          <h2 className="text-accent mb-6">Equipment we use</h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {equipment.value?.map(
              ({ id, name, description, imageUrl }: CaseStudyEquipment) => (
                <ItemCard
                  key={id}
                  name={name}
                  description={description}
                  imageUrl={imageUrl}
                />
              )
            )}
          </div>
        </section>
      )}

      <TestimonialsSection
        initialClients={clients.status === 'fulfilled' ? clients.value : []}
      />
    </>
  )
}
