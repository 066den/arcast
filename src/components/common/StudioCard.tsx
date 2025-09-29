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
    <div className="flex justify-center w-full">
      <div
        className={cn(
          'group relative aspect-[4/3] w-full overflow-hidden rounded-5xl cursor-pointer bg-white shadow-lg transition-transform duration-300 hover:shadow-xl',
          isSelection ? 'max-w-[440px]' : 'max-w-[540px]'
        )}
        onClick={handleClick}
      >
        <Image
          src={imageUrl || ''}
          alt={name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        <div className="absolute bottom-0 left-0 right-0 bg-primary py-5 px-8">
          <div className="flex flex-col space-y-2">
            <h3 className="text-[2.75em] font-nunito-sans font-bold text-white leading-tight">
              {name}
            </h3>
          </div>
        </div>

        {isSelection && (
          <div className="absolute top-4 right-4 size-11 flex items-center justify-center bg-primary rounded-full border-3 border-white">
            {isSelected && <div className="size-8 bg-accent rounded-full" />}
          </div>
        )}
      </div>
    </div>
  )
}
