'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ArrowIcon } from './icons'
import { Play } from 'lucide-react'
import useFlag from '@/hooks/useFlag'
import { VideoModal } from './modal'

interface SmoothOverlappingCarouselProps {
  items: Array<{
    id: string
    thumbUrl: string | null
    videoUrl?: string | null
    name: string | null
  }>
  className?: string
  autoplay?: boolean
  autoplayDelay?: number
}

const SmoothOverlappingCarousel = ({
  items,
  className,
  autoplay = false,
  autoplayDelay = 3000,
}: SmoothOverlappingCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null)
  const [isVideoModalOpen, videoOpen, videoClose] = useFlag()

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % items.length)
  }, [items.length])

  const prevSlide = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + items.length) % items.length)
  }, [items.length])

  const playVideo = useCallback(
    (videoUrl: string) => {
      if (videoUrl) {
        setSelectedVideoUrl(videoUrl)
        videoOpen()
      }
    },
    [videoOpen]
  )

  const handleCloseVideo = useCallback(() => {
    setSelectedVideoUrl(null)
    videoClose()
  }, [videoClose])

  useEffect(() => {
    if (!autoplay || isHovered || items.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % items.length)
    }, autoplayDelay)

    return () => clearInterval(interval)
  }, [autoplay, autoplayDelay, isHovered, items.length])

  if (items.length < 3) {
    return (
      <div className={cn('relative w-full h-[400px]', className)}>
        <div className="flex items-center justify-center gap-4">
          {items.map(item => (
            <div
              key={item.id}
              className="relative group cursor-pointer w-[325px] h-[360px]"
            >
              <Image
                src={item.thumbUrl || ''}
                alt={item.name || ''}
                width={325}
                height={360}
                className="rounded-2xl shadow-2xl transition-transform duration-300 group-hover:scale-105 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn('relative w-full', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full h-full flex items-center justify-center -ml-8">
        {items.map((item, index) => {
          let relativeIndex = index - currentIndex

          if (relativeIndex > items.length / 2) {
            relativeIndex -= items.length
          } else if (relativeIndex < -items.length / 2) {
            relativeIndex += items.length
          }

          const distance = Math.abs(relativeIndex)
          const isActive = relativeIndex === 0
          const isVisible = distance <= 2

          if (!isVisible) return null

          const offset = relativeIndex * 120
          const scale = isActive ? 1 : Math.max(0.6, 0.9 - distance * 0.15)
          const zIndex = isActive ? 10 : 10 - distance

          return (
            <div
              key={item.id}
              className="smooth-overlapping-item absolute"
              style={{
                transform: `translateX(${offset}px) scale(${scale})`,
                zIndex,
              }}
            >
              <div
                className="relative cursor-pointer w-[325px] h-[360px]"
                onClick={() => item.videoUrl && playVideo(item.videoUrl)}
              >
                <Image
                  src={item.thumbUrl || ''}
                  alt={item.name || ''}
                  width={325}
                  height={360}
                  priority={isActive}
                  loading={isActive ? 'eager' : 'lazy'}
                  className="rounded-3xl w-full h-full object-cover"
                />

                <div className="absolute group z-10 inset-0 flex items-center justify-center">
                  <div
                    className={cn(
                      'w-20 h-20 bg-white/80 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ease-in-out group-hover:bg-white',
                      isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                    )}
                  >
                    <Play
                      className="text-black ml-1 size-8"
                      fill="currentColor"
                    />
                  </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl" />
              </div>
            </div>
          )
        })}
      </div>

      <div className="absolute flex gap-4 right-0 top-0 -translate-y-[8em] z-20 ">
        <Button
          size="icon"
          className="rounded-full w-11 h-11 bg-border group hover:bg-primary"
          onClick={prevSlide}
        >
          <ArrowIcon
            size={24}
            degree={180}
            className="stroke-primary group-hover:stroke-white transition-all duration-300"
          />
        </Button>

        <Button
          size="icon"
          className="rounded-full w-11 h-11 bg-border group hover:bg-primary"
          onClick={nextSlide}
        >
          <ArrowIcon
            size={24}
            className="stroke-primary group-hover:stroke-white transition-all duration-300"
          />
        </Button>
      </div>

      {selectedVideoUrl && (
        <VideoModal
          isOpen={isVideoModalOpen}
          title={items[currentIndex].name || ''}
          videoUrl={selectedVideoUrl}
          poster={items[currentIndex].thumbUrl || undefined}
          onClose={handleCloseVideo}
        />
      )}
    </div>
  )
}

export default SmoothOverlappingCarousel
