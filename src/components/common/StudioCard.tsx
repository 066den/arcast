import { cn } from '@/lib/utils'
import { Studio } from '../../types'
import Image from 'next/image'
import {
  Carousel,
  CarouselItem,
  CarouselContent,
  CarouselPrevious,
  CarouselNext,
} from '../ui/carousel'

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

  return (
    <>
      <div
        className={cn(
          'relative aspect-[4/3] w-full max-w-[542px] overflow-hidden md:rounded-5xl rounded-3xl bg-white shadow-sm'
        )}
      >
        <Carousel className="h-full w-full">
          <CarouselContent className="h-full">
            <CarouselItem className="relative h-full">
              <Image
                src={imageUrl || ''}
                alt={name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            </CarouselItem>
            {gallery.map((image, index) => (
              <CarouselItem key={image} className="relative h-full">
                <Image
                  src={image || ''}
                  alt={`${name} - Gallery ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 opacity-30 hover:opacity-100" />
          <CarouselNext className="right-4 opacity-30 hover:opacity-100" />
        </Carousel>
        {/* <Image
          src={imageUrl || ''}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        /> */}

        {/* <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Eye className="size-14 text-white" />
          </div>
        </div> */}

        <div className="absolute bottom-0 left-0 right-0 md:py-5 p-5 md:px-10">
          <h3 className="sm:text-[2em] text-[1.5em] font-nunito-sans font-bold text-white leading-tight text-shadow-md">
            {name}
          </h3>
        </div>

        {isSelection && (
          <div
            onClick={e => {
              e.stopPropagation()
              handleClick()
            }}
            className="absolute sm:top-6 top-4 sm:right-6 right-4 sm:size-11 size-8 flex items-center justify-center bg-primary rounded-full border-3 border-white"
          >
            {isSelected && (
              <div className="md:size-8 size-6 bg-accent rounded-full" />
            )}
          </div>
        )}
      </div>
    </>
  )
}
