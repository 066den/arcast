'use client'
import Image from 'next/image'
import { CaseStudy } from '@/types'
import { useRouter } from 'next/navigation'

interface CaseStudyCardProps {
  caseStudy: CaseStudy
}

const CaseStudyCard = ({ caseStudy }: CaseStudyCardProps) => {
  const router = useRouter()
  const mainImage =
    caseStudy.client?.imageUrl || '/assets/images/case-banner.jpg'
  const clientName = caseStudy.client?.name || caseStudy.title || 'Client'
  const clientTagline = caseStudy.client?.showTitle || caseStudy.tagline || ''

  const handleClick = () => {
    router.push(`/case-studies/${caseStudy.id}`)
  }

  return (
    <div
      className="group relative aspect-[9/8] w-full overflow-hidden md:rounded-5xl rounded-3xl cursor-pointer bg-white shadow-lg transition-transform duration-300 hover:shadow-xl"
      onClick={handleClick}
    >
      <Image
        src={mainImage}
        alt={clientName}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />

      <div className="absolute bottom-0 left-0 right-0 bg-primary lg:py-5 md:py-4 py-2 lg:px-8 md:px-6 px-4">
        <div className="flex flex-col space-y-2">
          <h3 className="lg:text-[2.75em] text-[2em] font-nunito-sans font-bold text-white leading-tight">
            {clientName}
          </h3>

          {clientTagline && (
            <p className="lg:text-xl md:text-lg text-base font-nunito-sans text-accent font-bold leading-tight">
              {clientTagline}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default CaseStudyCard
