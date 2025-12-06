import HeroSection from '@/components/sections/HeroSection'
import IntroSection from '@/components/sections/IntroSection'
import AboutSection from '@/components/sections/AboutSection'
import EpisodeSection from '@/components/sections/EpisodeSection'
import { getPackages, getServiceTypes } from '@/services/servicesServices'
import { getClients, getSamples } from '@/services/studioServices'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import PackagesSection from '@/components/sections/PackagesSection'
import Marquee from '@/components/ui/marquee'
const videoUrl = '/assets/video/bg-hero-video.mp4'

export default async function Home() {
  const [serviceTypes, samples, clients, packages] = await Promise.allSettled([
    getServiceTypes(),
    getSamples(),
    getClients(),
    getPackages(),
  ])

  return (
    <>
      <HeroSection
        videoUrl={videoUrl}
        buttonUrl="https://api.whatsapp.com/send?phone=971508249795&text=i%20want%20to%20book%20to"
        poster="/assets/images/hero-bg.png"
      />
      <IntroSection />
      <AboutSection />
      <EpisodeSection
        initialServiceTypes={
          serviceTypes.status === 'fulfilled' ? serviceTypes.value : []
        }
        initialSamples={samples.status === 'fulfilled' ? samples.value : []}
      />
      <div className="w-full xl:py-8">
        <Marquee className="outline-text" direction="left" speed={300}>
          become the next shining star&nbsp;
        </Marquee>
      </div>

      <TestimonialsSection
        isVideo
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
