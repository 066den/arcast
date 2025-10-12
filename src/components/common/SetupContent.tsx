'use client'
import { Studio } from '@/types'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '../ui/carousel'
import Image from 'next/image'
import ReactHtmlParser from 'html-react-parser'
import { Button } from '../ui/button'
import { ChevronRightIcon } from 'lucide-react'
import useBookingStore from '@/store/useBookingStore'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/constants'

interface SetupContentProps {
  title: string
  content: string
  studio: Studio
}

const SetupContent = ({ title, content, studio }: SetupContentProps) => {
  const { imageUrl, name, gallery } = studio
  const router = useRouter()
  const { selectStudio } = useBookingStore()

  const handleBookNow = () => {
    selectStudio(studio.id)
    router.push(ROUTES.BOOKING)
  }

  return (
    <div className="space-y-4">
      <div className="container mx-auto px-4">
        <h2 className="text-accent">{title}</h2>
      </div>
      <div className="aspect-[16/9]">
        <Carousel className="h-full w-full">
          <CarouselContent className="h-full">
            <CarouselItem className="relative h-full">
              <Image
                src={imageUrl || ''}
                alt={name}
                fill
                sizes="100vw"
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
      </div>

      <div className="container mx-auto px-4">
        <div className="text-content lg:text-3xl sm:text-2xl text-xl py-8 font-nunito-sans">
          {ReactHtmlParser(content)}
        </div>
        <Button
          size="lg"
          variant="primary"
          icon={<ChevronRightIcon className="size-7" />}
          className="hidden lg:flex group"
          onClick={handleBookNow}
        >
          Book this setup
        </Button>
      </div>
    </div>
  )
}

export default SetupContent
