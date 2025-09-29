'use client'
import { Studio } from '@/types'
import { StudioCard } from '../common/StudioCard'

interface StudiosSectionProps {
  initialStudios: Studio[]
}

const StudiosSection = ({ initialStudios }: StudiosSectionProps) => {
  return (
    <>
      <section className="py-10">
        <h2 className="text-accent">Our beautiful studios</h2>
        <div className="grid grid-cols-2 gap-16 py-12">
          {initialStudios.map(studio => (
            <StudioCard key={studio.id} studio={studio} onClick={() => {}} />
          ))}
        </div>
      </section>
    </>
  )
}

export default StudiosSection
