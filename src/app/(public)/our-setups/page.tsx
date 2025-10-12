import HeroSection from '@/components/sections/HeroSection'
import {
  getClients,
  getEquipment,
  getStaff,
  getStudios,
} from '@/services/studioServices'
import SetupContent from '@/components/common/SetupContent'
import setupData from '@/data/SetupContent.json'
import ItemCard from '@/components/common/ItemCard'
import { CaseStudyEquipment, CaseStudyStaff } from '@/types'
import TestimonialsSection from '@/components/sections/TestimonialsSection'

export default async function OurSetups() {
  const [studios, staff, equipment, clients] = await Promise.allSettled([
    getStudios(),
    getStaff(),
    getEquipment(),
    getClients(),
  ])
  return (
    <>
      <HeroSection
        title="Our Setups"
        description="Our beautiful studios and gear"
        image="/assets/images/setups-banner.jpg"
      />
      <section className="py-10 xl:py-16 xl:space-y-8 space-y-4">
        <h2 className="text-accent">Studio Spaces Designed for Every Story</h2>
        <h3>
          Every great show needs the right atmosphere.
          <br />
          From professional to personal, find your perfect stage <br /> to
          connect with your audience.
        </h3>
      </section>
      <div className="xl:space-y-24 space-y-6 xl:mb-16 mb-2">
        {setupData.map(
          ({ title, content }, index) =>
            studios.status === 'fulfilled' && (
              <SetupContent
                key={title}
                title={title}
                content={content}
                studio={studios.value[index]}
              />
            )
        )}
      </div>
      {equipment.status === 'fulfilled' && equipment.value.length > 0 && (
        <section className="xl:py-12 py-6">
          <h2 className="text-accent xl:mb-14 mb-4">
            Professional-Grade, State of the Art Gear
          </h2>
          <h3 className="xl:mb-8">
            We invested in the best gear in the industry,
            <br /> so you can focus on what matters most - your content.
          </h3>
          <div className="grid sm:grid-cols-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-5 sm:gap-8 gap-4 py-8">
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

      {staff.status === 'fulfilled' && staff.value.length > 0 && (
        <section className="xl:py-12 py-2 mb-8">
          <h2 className="text-accent xl:mb-14 mb-4">
            Meet Your Production Partners
          </h2>
          <h3 className="xl:mb-8">
            Our experienced team ensures your recording runs flawlessly. Focus
            on your conversation, we&apos;ll handle the rest.
          </h3>
          <div className="grid sm:grid-cols-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-5 sm:gap-8 gap-4 py-8">
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
          <TestimonialsSection
            initialClients={clients.status === 'fulfilled' ? clients.value : []}
          />
        </section>
      )}
    </>
  )
}
