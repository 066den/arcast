import HeroSection from '@/components/sections/HeroSection'
import CaseStudiesList from '@/components/common/CaseStudiesList'
import { getCases, getClients } from '@/services/studioServices'
import { CaseStudy } from '@/types'
import TestimonialsSection from '@/components/sections/TestimonialsSection'

export default async function CaseStudiesPage() {
  const cases = await getCases()
  const clients = await getClients()

  return (
    <>
      <HeroSection
        title="Case Studies"
        description="How have we solved the real issues of our clients"
        image="/assets/images/case-banner.jpg"
      />
      <section className="xl:py-10">
        <CaseStudiesList cases={cases as unknown as CaseStudy[]} />
      </section>
      <TestimonialsSection showButton={false} initialClients={clients} />
    </>
  )
}
