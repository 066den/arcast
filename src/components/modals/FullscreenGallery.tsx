'use client'

import { useState, useEffect, useCallback } from 'react'
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

interface FullscreenGalleryProps {
  images: string[]
  title?: string
  isOpen: boolean
  onClose: () => void
  currentIndex?: number
}

export function FullscreenGallery({
  images,
  title,
  isOpen,
  onClose,
  currentIndex = 0,
}: FullscreenGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(currentIndex)
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showThumbnails, setShowThumbnails] = useState(true)
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 })
  const [lastTouchTime, setLastTouchTime] = useState(0)
  const [initialDistance, setInitialDistance] = useState(0)
  const [initialZoom, setInitialZoom] = useState(1)

  useEffect(() => {
    if (isOpen) {
      setActiveIndex(currentIndex)
      setZoom(1)
      setPosition({ x: 0, y: 0 })
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, currentIndex])

  const resetZoom = useCallback(() => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  const goToPrevious = useCallback(() => {
    setActiveIndex(prev => (prev > 0 ? prev - 1 : images.length - 1))
    resetZoom()
  }, [images.length, resetZoom])

  const goToNext = useCallback(() => {
    setActiveIndex(prev => (prev < images.length - 1 ? prev + 1 : 0))
    resetZoom()
  }, [images.length, resetZoom])

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * 1.5, 5))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / 1.5, 0.5))
  }, [])

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
      } else if (images.length > 1) {
        e.preventDefault()
        if (e.deltaY > 0) {
          goToNext()
        } else {
          goToPrevious()
        }
      }
    }

    // Add wheel event listener with passive: false
    document.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      document.removeEventListener('wheel', handleWheel)
    }
  }, [
    isOpen,
    images.length,
    goToNext,
    goToPrevious,
    handleZoomIn,
    handleZoomOut,
  ])

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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return
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
      setLastTouchTime(Date.now())
    } else if (e.touches.length === 2) {
      const distance = getDistance(e.touches)
      setInitialDistance(distance)
      setInitialZoom(zoom)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && zoom > 1) {
      const touch = e.touches[0]
      setPosition({
        x: touch.clientX - touchStart.x,
        y: touch.clientY - touchStart.y,
      })
    } else if (e.touches.length === 2 && initialDistance > 0) {
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

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      const touchDuration = Date.now() - lastTouchTime
      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStart.x
      const deltaY = touch.clientY - touchStart.y
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      // Single tap navigation (if touch was quick and short)
      if (
        touchDuration < 300 &&
        distance < 50 &&
        zoom <= 1 &&
        images.length > 1
      ) {
        const centerX = window.innerWidth / 2
        if (touch.clientX < centerX) {
          goToPrevious()
        } else {
          goToNext()
        }
      }
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

  const currentImage = images[activeIndex]

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

      <div className="flex items-center justify-center h-full px-4 sm:px-8 md:px-16 pt-16 pb-20 sm:pb-32 relative z-10">
        <div
          className="relative w-full h-full cursor-move select-none touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          }}
        >
          <Image
            src={currentImage}
            alt={`Gallery image ${activeIndex + 1}`}
            fill
            sizes="1200px"
            className="w-full h-full object-contain"
            priority
          />
        </div>
      </div>

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

      {showThumbnails && images.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-20 p-2 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex justify-center gap-1 sm:gap-2 overflow-x-auto max-w-full pb-2">
            {images.map((image, index) => (
              <Button
                key={index}
                onClick={e => {
                  e.stopPropagation()
                  setActiveIndex(index)
                  resetZoom()
                }}
                className={cn(
                  'relative flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all duration-200',
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
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="absolute inset-0 z-0" onClick={() => onClose?.()} />
    </div>
  )
}
