import HeroSection from '@/components/sections/HeroSection'
import IntroSection from '@/components/sections/IntroSection'
import AboutSection from '@/components/sections/AboutSection'
import EpisodeSection from '@/components/sections/EpisodeSection'
import { getServices } from '@/services/servicesServices'
import { getClients, getSamples } from '@/services/studioServices'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import PackagesSection from '@/components/sections/PackagesSection'
import Marquee from '@/components/ui/marquee'
const videoUrl = '/assets/video/bg-hero-video.mp4'

export default async function Home() {
  const [services, samples, clients] = await Promise.all([
    getServices(),
    getSamples(),
    getClients(),
  ])
  return (
    <div className="py-4">
      <HeroSection videoUrl={videoUrl} />
      <IntroSection />
      <AboutSection />
      <EpisodeSection initialServices={services} initialSamples={samples} />
      <div className="w-full py-8">
        <Marquee className="outline-text" direction="left" speed={10}>
          become the next shining star
        </Marquee>
      </div>

      <TestimonialsSection initialClients={clients} />
      <PackagesSection initialServices={services} initialPackages={[]} />
    </div>
  )
}
