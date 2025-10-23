'use client'
import { Studio } from '@/types'
import { StudioCard } from '../common/StudioCard'

interface StudiosSectionProps {
  initialStudios: Studio[]
}

const StudiosSection = ({ initialStudios }: StudiosSectionProps) => {
  return (
    <>
      <section className="lg:py-10 sm:py-6 py-2">
        <h2 className="text-accent">Our beautiful studios</h2>
        <div className="grid lg:grid-cols-2 grid-cols-1 justify-items-center lg:gap-16 gap-6 lg:py-12 py-6">
          {initialStudios.map(studio => (
            <StudioCard key={studio.id} studio={studio} />
          ))}
        </div>
      </section>
    </>
  )
}

export default StudiosSection
