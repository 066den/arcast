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
import Headline from '@/components/common/Headline'

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

      <section className="lg:py-14 py-6 text-content blog-text-content">
        <Headline
          title="Hi, I’m Alexey Redkin,<br />Founder of Arcast"
          description="<h3>Two years ago, I started creating content in Dubai. <br /> I wanted to grow my personal brand, launch projects, and scale.</h3>"
          image="/assets/images/alex.jpg"
        />

        <p>
          But I quickly realized: without content and an audience, it’s nearly
          impossible to move forward. You can be a great expert, but if no one
          knows you — it’s like you don’t exist.
        </p>
        <p>
          I visited dozens of studios. Hired videographers, freelancers,
          scriptwriters. Spent a whole year experimenting — and nothing worked.
        </p>
        <p>
          Turns out, most studios just rent you a room with a camera. No
          guidance. No support. You stand in front of the camera — stressed,
          unsure of what to say or how to act.
        </p>
        <p>That’s when the idea for Arcast was born.</p>
        <p>
          Arcast isn’t just a studio. It’s a space where your content becomes
          stronger — with real support.
        </p>
        <ul>
          <li>We help you clarify your goal</li>
          <li>Find the right format</li>
          <li>Support you during filming</li>
          <li>Guide you from idea to final result</li>
        </ul>
        <p>
          We have a cameraman, and I’m personally involved in the process. We
          create an atmosphere where it’s easy to be yourself.
        </p>
        <p>
          And I truly believe that podcasts are digital journals. In 10–20
          years, you’ll be able to look back and hear how you used to think.
          That’s memory. That’s legacy. That’s something that stays.
        </p>
        <p>
          Now you can record content with ease — and real support. While others
          rent cameras, you create results. Message us — and start speaking so
          that people actually listen.
        </p>
      </section>
      <StudiosSection
        initialStudios={studios.status === 'fulfilled' ? studios.value : []}
      />
      {staff.status === 'fulfilled' && staff.value.length > 0 && (
        <section className="lg:py-12 py-6">
          <h2 className="text-accent mb-6">Our talent support team</h2>
          <div className="grid sm:grid-cols-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-5 sm:gap-8 gap-4">
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
        <section className="lg:py-12 py-6">
          <h2 className="text-accent mb-6">Equipment we use</h2>
          <div className="grid sm:grid-cols-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-5 sm:gap-8 gap-4">
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
