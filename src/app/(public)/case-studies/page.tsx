import HeroSection from '@/components/sections/HeroSection'
import CaseStudiesList from '@/components/common/CaseStudiesList'
import { getCases } from '@/services/studioServices'
import PackagesSection from '@/components/sections/PackagesSection'
import { getPackages, getServiceTypes } from '@/services/servicesServices'
import { CaseStudy } from '@/types'

export default async function CaseStudiesPage() {
  const cases = await getCases()
  const [initialServiceTypes, initialPackages] = await Promise.all([
    getServiceTypes(),
    getPackages(),
  ])

  return (
    <>
      <HeroSection
        title="Case Studies"
        description="How have we solved the real issues of our clients"
        image="/assets/images/case-banner.jpg"
      />
      <section className="py-4 xl:py-10">
        <CaseStudiesList cases={cases as unknown as CaseStudy[]} />
      </section>
      <PackagesSection
        initialServiceTypes={initialServiceTypes}
        initialPackages={initialPackages}
      />
    </>
  )
}
