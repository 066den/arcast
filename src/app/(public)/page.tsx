import HeroSection from '@/components/sections/HeroSection'
import IntroSection from '@/components/sections/IntroSection'
import AboutSection from '@/components/sections/AboutSection'
import EpisodeSection from '@/components/sections/EpisodeSection'
import { getServiceTypes } from '@/services/servicesServices'
import { getClients, getSamples } from '@/services/studioServices'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import PackagesSection from '@/components/sections/PackagesSection'
import Marquee from '@/components/ui/marquee'
import videoUrl from 'https://res.cloudinary.com/deuvbiekl/video/upload/v1747050218/desk_bgzsdy.mp4'

export default async function Home() {
  const [serviceTypes, samples, clients] = await Promise.all([
    getServiceTypes(),
    getSamples(),
    getClients(),
  ])

  return (
    <>
      <HeroSection videoUrl={videoUrl} />
      <IntroSection />
      <AboutSection />
      <EpisodeSection
        initialServiceTypes={serviceTypes}
        initialSamples={samples}
      />
      <div className="w-full py-8">
        <Marquee className="outline-text" direction="left" speed={300}>
          become the next shining star&nbsp;
        </Marquee>
      </div>

      <TestimonialsSection initialClients={clients} />
      <PackagesSection
        initialServiceTypes={serviceTypes}
        initialPackages={[]}
      />
    </>
  )
}
