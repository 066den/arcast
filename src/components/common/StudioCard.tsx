import { cn } from '@/lib/utils'
import { Studio } from '../../types'
import Image from 'next/image'

interface StudioCardProps {
  studio: Studio
  isSelected?: boolean
  isSelection?: boolean
  onClick: (id: string) => void
}

export function StudioCard({
  studio,
  isSelected,
  isSelection,
  onClick,
}: StudioCardProps) {
  const { name, imageUrl } = studio
  const handleClick = () => {
    onClick(studio.id)
  }

  return (
    <div
      className={cn(
        'group relative aspect-[4/3] w-full overflow-hidden md:rounded-5xl rounded-3xl cursor-pointer bg-white shadow-lg transition-transform duration-300 hover:shadow-xl',
        isSelection ? 'max-w-[440px]' : 'max-w-[540px]'
      )}
      onClick={handleClick}
    >
      <Image
        src={imageUrl || ''}
        alt={name}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />

      <div className="absolute bottom-0 left-0 right-0 bg-primary lg:py-5 py-4 lg:px-8 px-6">
        <div className="flex flex-col space-y-2">
          <h3 className="lg:text-[2.75em] md:text-[2em] text-[1.5em] font-nunito-sans font-bold text-white leading-tight">
            {name}
          </h3>
        </div>
      </div>

      {isSelection && (
        <div className="absolute top-4 right-4 md:size-11 size-8 flex items-center justify-center bg-primary rounded-full border-3 border-white">
          {isSelected && (
            <div className="md:size-8 size-6 bg-accent rounded-full" />
          )}
        </div>
      )}
    </div>
  )
}
