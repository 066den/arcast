'use client'
import { ROUTES } from '@/lib/constants'
import Headline from '../common/Headline'
import { useRouter } from 'next/navigation'
const IntroSection = () => {
  const router = useRouter()

  const handleViewOurServices = () => {
    router.push(ROUTES.SERVICES)
  }

  const handleBookACall = () => {
    //navigateWithScroll(ROUTES.BOOKING)
  }
  return (
    <section className="sm:py-6 py-2 xl:py-14">
      <Headline
        title="Your personal content factory in Dubai"
        description={`<h3>We produce, edit, publish <br /> your podcasts and Reels <br/> From idea to audience growth</h3>`}
        image="/assets/images/features.webp"
        actionSection={[
          { label: 'View Our Services', event: handleViewOurServices },
          { label: 'Book a Call', event: handleBookACall },
        ]}
      />
    </section>
  )
}

export default IntroSection
