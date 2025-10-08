'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
} from 'lucide-react'
import useEmblaCarousel from 'embla-carousel-react'

interface FullscreenGalleryEmblaProps {
  images: string[]
  title?: string
  isOpen: boolean
  onClose: () => void
  currentIndex?: number
}

export function FullscreenGalleryEmbla({
  images,
  title,
  isOpen,
  onClose,
  currentIndex = 0,
}: FullscreenGalleryEmblaProps) {
  const [activeIndex, setActiveIndex] = useState(currentIndex)
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showThumbnails, setShowThumbnails] = useState(true)
  const [initialDistance, setInitialDistance] = useState(0)
  const [initialZoom, setInitialZoom] = useState(1)
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 })

  // Embla Carousel setup
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    skipSnaps: false,
    duration: 20,
  })

  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true,
  })

  useEffect(() => {
    if (isOpen) {
      setActiveIndex(currentIndex)
      setZoom(1)
      setPosition({ x: 0, y: 0 })
      document.body.style.overflow = 'hidden'

      // Jump to the current index when opening
      if (emblaApi) {
        emblaApi.scrollTo(currentIndex, true)
      }
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, currentIndex, emblaApi])

  // Update active index when carousel scrolls
  useEffect(() => {
    if (!emblaApi) return

    const onSelect = () => {
      const index = emblaApi.selectedScrollSnap()
      setActiveIndex(index)
      setZoom(1)
      setPosition({ x: 0, y: 0 })
    }

    emblaApi.on('select', onSelect)
    onSelect()

    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi])

  // Sync thumbnail carousel with main carousel
  useEffect(() => {
    if (!emblaApi || !emblaThumbsApi) return

    const onSelect = () => {
      const index = emblaApi.selectedScrollSnap()
      emblaThumbsApi.scrollTo(index)
    }

    emblaApi.on('select', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, emblaThumbsApi])

  const resetZoom = useCallback(() => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  const goToPrevious = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const goToNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index)
    },
    [emblaApi]
  )

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * 1.5, 5))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / 1.5, 0.5))
  }, [])

  // Wheel event for zoom and navigation
  useEffect(() => {
    if (!isOpen) return

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        if (e.deltaY < 0) {
          handleZoomIn()
        } else {
          handleZoomOut()
        }
      } else if (images.length > 1 && zoom <= 1) {
        e.preventDefault()
        if (e.deltaY > 0) {
          goToNext()
        } else {
          goToPrevious()
        }
      }
    }

    document.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      document.removeEventListener('wheel', handleWheel)
    }
  }, [
    isOpen,
    images.length,
    zoom,
    goToNext,
    goToPrevious,
    handleZoomIn,
    handleZoomOut,
  ])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose?.()
          break
        case 'ArrowLeft':
          e.preventDefault()
          goToPrevious()
          break
        case 'ArrowRight':
          e.preventDefault()
          goToNext()
          break
        case '+':
        case '=':
          e.preventDefault()
          handleZoomIn()
          break
        case '-':
          e.preventDefault()
          handleZoomOut()
          break
        case '0':
          e.preventDefault()
          resetZoom()
          break
        case 'h':
          e.preventDefault()
          setShowThumbnails(prev => !prev)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [
    isOpen,
    goToPrevious,
    goToNext,
    handleZoomIn,
    handleZoomOut,
    resetZoom,
    onClose,
  ])

  // Mouse drag for panning when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Touch gestures
  const getDistance = (touches: React.TouchList) => {
    const touch1 = touches[0]
    const touch2 = touches[1]
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      setTouchStart({ x: touch.clientX, y: touch.clientY })
    } else if (e.touches.length === 2) {
      // Pinch to zoom
      const distance = getDistance(e.touches)
      setInitialDistance(distance)
      setInitialZoom(zoom)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && zoom > 1) {
      // Pan when zoomed in
      const touch = e.touches[0]
      const deltaX = touch.clientX - touchStart.x
      const deltaY = touch.clientY - touchStart.y
      setPosition({
        x: deltaX,
        y: deltaY,
      })
    } else if (e.touches.length === 2 && initialDistance > 0) {
      // Pinch to zoom
      try {
        e.preventDefault()
      } catch {
        // Ignore passive event listener errors
      }
      const distance = getDistance(e.touches)
      const scale = distance / initialDistance
      const newZoom = Math.max(0.5, Math.min(5, initialZoom * scale))
      setZoom(newZoom)
    }
  }

  if (!isOpen || !images) return null

  if (images.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-2 sm:p-4 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            {title && (
              <h2 className="text-white text-sm sm:text-lg font-semibold truncate max-w-[200px] sm:max-w-none">
                {title}
              </h2>
            )}
            <span className="text-white/70 text-xs sm:text-sm whitespace-nowrap">
              0 / 0
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={e => {
                e.stopPropagation()
                onClose?.()
              }}
              className="text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10"
            >
              <X className="size-3 sm:size-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-center h-full">
          <div className="text-white text-center">
            <p className="text-lg mb-2">No images</p>
            <p className="text-sm text-white/70">Gallery is empty</p>
          </div>
        </div>
        <div className="absolute inset-0 z-0" onClick={() => onClose?.()} />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-2 sm:p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          {title && (
            <h2 className="text-white text-sm sm:text-lg font-semibold truncate max-w-[200px] sm:max-w-none">
              {title}
            </h2>
          )}
          <span className="text-white/70 text-xs sm:text-sm whitespace-nowrap">
            {activeIndex + 1} / {images.length}
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={e => {
              e.stopPropagation()
              setShowThumbnails(prev => !prev)
            }}
            className="text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10"
          >
            <Maximize2 className="size-3 sm:size-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={e => {
              e.stopPropagation()
              onClose?.()
            }}
            className="text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10"
          >
            <X className="size-3 sm:size-4" />
          </Button>
        </div>
      </div>

      {/* Main Carousel */}
      <div className="flex items-center justify-center h-full px-4 sm:px-8 md:px-16 pt-16 pb-20 sm:pb-32 relative z-10">
        <div className="embla w-full h-full" ref={emblaRef}>
          <div className="embla__container h-full flex">
            {images.map((image, index) => (
              <div
                key={index}
                className="embla__slide flex-[0_0_100%] min-w-0 relative h-full"
              >
                <div
                  className="relative w-full h-full cursor-move select-none touch-none flex items-center justify-center"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  style={{
                    transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                    transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                  }}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={image}
                      alt={`Gallery image ${index + 1}`}
                      fill
                      sizes="1200px"
                      className="w-full h-full object-contain"
                      priority={Math.abs(index - activeIndex) <= 1}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={e => {
              e.stopPropagation()
              goToPrevious()
            }}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 text-white hover:bg-white/20 h-10 w-10 sm:h-12 sm:w-12 hidden sm:flex"
          >
            <ChevronLeft className="size-5 sm:size-6" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={e => {
              e.stopPropagation()
              goToNext()
            }}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 text-white hover:bg-white/20 h-10 w-10 sm:h-12 sm:w-12 hidden sm:flex"
          >
            <ChevronRight className="size-5 sm:size-6" />
          </Button>
        </>
      )}

      {/* Zoom Controls */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-16 sm:bottom-20 z-20 items-center gap-1 sm:gap-2 bg-black/50 backdrop-blur-sm rounded-full p-1 sm:p-2 hidden sm:flex">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={e => {
            e.stopPropagation()
            handleZoomOut()
          }}
          className="text-white hover:bg-white/20 h-7 w-7 sm:h-8 sm:w-8"
          disabled={zoom <= 0.5}
        >
          <ZoomOut className="size-3 sm:size-4" />
        </Button>
        <span className="text-white text-xs sm:text-sm px-1 sm:px-2 min-w-[2.5rem] sm:min-w-[3rem] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={e => {
            e.stopPropagation()
            handleZoomIn()
          }}
          className="text-white hover:bg-white/20 h-7 w-7 sm:h-8 sm:w-8"
          disabled={zoom >= 5}
        >
          <ZoomIn className="size-3 sm:size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={e => {
            e.stopPropagation()
            resetZoom()
          }}
          className="text-white hover:bg-white/20 h-7 w-7 sm:h-8 sm:w-8"
        >
          <RotateCcw className="size-3 sm:size-4" />
        </Button>
      </div>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-20 p-2 bg-gradient-to-t from-black/50 to-transparent">
          <div className="embla-thumbs overflow-hidden" ref={emblaThumbsRef}>
            <div className="embla-thumbs__container flex gap-1 sm:gap-2 justify-center">
              {images.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={e => {
                    e.stopPropagation()
                    scrollTo(index)
                  }}
                  className={cn(
                    'embla-thumbs__slide relative flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all duration-200',
                    index === activeIndex
                      ? 'border-white'
                      : 'border-white/30 hover:border-white/60'
                  )}
                >
                  <Image
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      <div className="absolute inset-0 z-0" onClick={() => onClose?.()} />
    </div>
  )
}
