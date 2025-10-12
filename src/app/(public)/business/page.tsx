import HeroSection from '@/components/sections/HeroSection'
import { getServicesByType } from '@/services/servicesServices'
import ServiceCard from '@/components/servicesComponents/ServiceCard'
import Image from 'next/image'
import BusinessCardSection from '@/components/sections/BusinessCardSection'

export default async function BusinessPage() {
  const initialServices = await getServicesByType('podcast')

  return (
    <>
      <HeroSection
        title="For Business"
        description="Professional video content production tailored to elevate your brand's digital presence."
        image="/assets/images/business-banner.webp"
      />
      <section className="lg:py-12 py-6 text-center max-w-4xl">
        <h3 className="text-accent">
          Done-For-You Content That Makes You Look Good And attracts the kind of
          clients you actually want.
        </h3>
      </section>

      <section className="lg:py-12 py-6 space-y-6">
        <h2>
          What <strong>you get</strong>
        </h2>
        <h3>
          Professional video content production tailored <br /> to elevate your
          brand&apos;s digital presence.
        </h3>
      </section>

      <BusinessCardSection />

      <section className="lg:py-12 py-6 space-y-6">
        <h2>
          Who <strong>it works</strong>
        </h2>
        <div>
          <Image
            src={'/assets/images/how-it-works.png'}
            alt="how-it-works"
            width={1200}
            height={600}
            className="hidden md:block w-full h-full object-cover"
          />
          <Image
            src={'/assets/images/how-it-works-mobile.png'}
            alt="how-it-works"
            width={800}
            height={1200}
            className="md:hidden w-full h-full object-cover"
          />
        </div>
      </section>

      <section className="lg:py-12 py-6 space-y-8">
        <h2>
          Our <strong>beneficial packages</strong>
        </h2>
        <h3>
          Here&apos;s exactly what you get with each package. No fluff, just
          results-driven deliverables designed to grow your brand.
        </h3>
        <div className="flex justify-center flex-wrap gap-4 py-4">
          {initialServices.map(service => (
            <div
              key={service.id}
              className="max-w-[280px] lg:max-w-[300px] 2xl:max-w-[325px]"
            >
              <div className="h-full">
                <ServiceCard service={service} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
