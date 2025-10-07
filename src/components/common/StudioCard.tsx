import { cn } from '@/lib/utils'
import { Studio } from '../../types'
import Image from 'next/image'
import { Eye } from 'lucide-react'
import { FullscreenGallery } from '../ui/FullscreenGallery'
import { useState } from 'react'

interface StudioCardProps {
  studio: Studio
  isSelected?: boolean
  isSelection?: boolean
  onClick?: (id: string) => void
}

export function StudioCard({
  studio,
  isSelected,
  isSelection,
  onClick,
}: StudioCardProps) {
  const { name, imageUrl, gallery } = studio

  const handleClick = () => {
    if (onClick) {
      onClick(studio.id)
    }
  }

  const [isOpen, setIsOpen] = useState(false)

  const openGallery = () => {
    setIsOpen(true)
  }

  const closeGallery = () => {
    setIsOpen(false)
  }
  return (
    <div
      className={cn(
        'group relative aspect-[4/3] w-full overflow-hidden md:rounded-5xl rounded-3xl cursor-pointer bg-white shadow-lg transition-transform duration-300 hover:shadow-xl',
        isSelection ? 'max-w-[440px]' : 'max-w-[540px]'
      )}
      onClick={openGallery}
    >
      <Image
        src={imageUrl || ''}
        alt={name}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Eye className="size-14 text-white" />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-primary lg:py-5 py-4 lg:px-8 px-6">
        <div className="flex flex-col space-y-2">
          <h3 className="lg:text-[2.75em] md:text-[2em] text-[1.5em] font-nunito-sans font-bold text-white leading-tight">
            {name}
          </h3>
        </div>
      </div>

      {isSelection && (
        <div
          onClick={e => {
            e.stopPropagation()
            handleClick()
          }}
          className="absolute top-4 right-4 md:size-11 size-8 flex items-center justify-center bg-primary rounded-full border-3 border-white"
        >
          {isSelected && (
            <div className="md:size-8 size-6 bg-accent rounded-full" />
          )}
        </div>
      )}
      <FullscreenGallery
        images={gallery || []}
        isOpen={isOpen}
        onClose={closeGallery}
        title={name || 'Gallery'}
      />
    </div>
  )
}
