import HeroSection from '@/components/sections/HeroSection'
import IntroSection from '@/components/sections/IntroSection'
import AboutSection from '@/components/sections/AboutSection'
import EpisodeSection from '@/components/sections/EpisodeSection'
import { getPackages, getServiceTypes } from '@/services/servicesServices'
import { getClients, getSamples } from '@/services/studioServices'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import PackagesSection from '@/components/sections/PackagesSection'
import Marquee from '@/components/ui/marquee'
import videoUrl from 'https://res.cloudinary.com/deuvbiekl/video/upload/v1747050218/desk_bgzsdy.mp4'

export default async function Home() {
  const [serviceTypes, samples, clients, packages] = await Promise.allSettled([
    getServiceTypes(),
    getSamples(),
    getClients(),
    getPackages(),
  ])

  return (
    <>
      <HeroSection videoUrl={videoUrl} />
      <IntroSection />
      <AboutSection />
      <EpisodeSection
        initialServiceTypes={
          serviceTypes.status === 'fulfilled' ? serviceTypes.value : []
        }
        initialSamples={samples.status === 'fulfilled' ? samples.value : []}
      />
      <div className="w-full py-8">
        <Marquee className="outline-text" direction="left" speed={300}>
          become the next shining star&nbsp;
        </Marquee>
      </div>

      <TestimonialsSection
        initialClients={clients.status === 'fulfilled' ? clients.value : []}
      />
      <PackagesSection
        initialServiceTypes={
          serviceTypes.status === 'fulfilled' ? serviceTypes.value : []
        }
        initialPackages={packages.status === 'fulfilled' ? packages.value : []}
      />
    </>
  )
}
