'use client'
import Headline from '../common/Headline'

const IntroSection = () => {
  return (
    <section className="py-14">
      <Headline
        title="Your personal content factory in Dubai"
        description={`We produce, edit, and publish your \n podcasts and Reels — from idea to audience growth.`}
        image="/assets/images/features.webp"
        actionSection={[
          { label: 'View Packages', event: () => {} },
          { label: 'Book a Call', event: () => {} },
        ]}
      />
    </section>
  )
}

export default IntroSection
