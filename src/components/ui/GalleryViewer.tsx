'use client'

import Image from 'next/image'
import { useState } from 'react'
import { FullscreenGallery } from './FullscreenGallery'
import { cn } from '@/lib/utils'
import { Eye, Grid3X3 } from 'lucide-react'
import { Button } from './button'

interface GalleryViewerProps {
  images: string[]
  title?: string
  className?: string
  gridCols?: 2 | 3 | 4 | 5
  aspectRatio?: 'square' | '4/3' | '16/9' | 'auto'
  showViewButton?: boolean
  maxImages?: number
}

export function GalleryViewer({
  images,
  title,
  className,
  gridCols = 3,
  aspectRatio = '4/3',
  showViewButton = true,
  maxImages,
}: GalleryViewerProps) {
  const [showAll, setShowAll] = useState(false)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const displayImages =
    maxImages && !showAll ? images.slice(0, maxImages) : images

  const remainingCount =
    maxImages && images.length > maxImages && !showAll
      ? images.length - maxImages
      : 0

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square'
      case '16/9':
        return 'aspect-video'
      case 'auto':
        return 'aspect-auto'
      default:
        return 'aspect-[4/3]'
    }
  }

  const getGridColsClass = () => {
    switch (gridCols) {
      case 2:
        return 'grid-cols-2'
      case 4:
        return 'grid-cols-4'
      case 5:
        return 'grid-cols-5'
      default:
        return 'grid-cols-3'
    }
  }

  if (!images || images.length === 0) {
    return null
  }

  return (
    <div className={cn('w-full', className)}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          {showViewButton && images.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentImageIndex(0)
                setIsGalleryOpen(true)
              }}
              className="flex items-center gap-2"
            >
              <Grid3X3 className="size-4" />
              Просмотр галереи
            </Button>
          )}
        </div>
      )}

      <div className={cn('grid gap-2', getGridColsClass())}>
        {displayImages.map((image, index) => (
          <div
            key={image}
            className={cn(
              'relative rounded-md overflow-hidden group cursor-pointer',
              getAspectRatioClass()
            )}
            onClick={() => {
              setCurrentImageIndex(index)
              setIsGalleryOpen(true)
            }}
          >
            <Image
              src={image}
              alt={`Gallery image ${index + 1}`}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover transition-transform duration-200 group-hover:scale-105"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="bg-white/90 hover:bg-white text-black"
                >
                  <Eye className="size-4" />
                </Button>
              </div>
            </div>

            {/* Show remaining count on last visible image */}
            {index === displayImages.length - 1 && remainingCount > 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">
                  +{remainingCount} ещё
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Show More Button */}
      {remainingCount > 0 && (
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            onClick={() => setShowAll(true)}
            className="w-full"
          >
            Показать все ({images.length} изображений)
          </Button>
        </div>
      )}

      <FullscreenGallery
        images={images}
        title={title || 'Галерея изображений'}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        currentIndex={currentImageIndex}
      />
    </div>
  )
}

interface GalleryCardProps {
  images: string[]
  title?: string
  subtitle?: string
  className?: string
  aspectRatio?: 'square' | '4/3' | '16/9'
  showCount?: boolean
}

export function GalleryCard({
  images,
  title,
  subtitle,
  className,
  aspectRatio = '4/3',
  showCount = true,
}: GalleryCardProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square'
      case '16/9':
        return 'aspect-video'
      default:
        return 'aspect-[4/3]'
    }
  }

  if (!images || images.length === 0) return null

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'relative rounded-lg overflow-hidden group cursor-pointer',
          getAspectRatioClass()
        )}
        onClick={() => {
          setCurrentImageIndex(0)
          setIsGalleryOpen(true)
        }}
      >
        <Image
          src={images[0]}
          alt={title || 'Gallery'}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-200 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {title && (
              <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
            )}
            {subtitle && (
              <p className="text-white/80 text-sm mb-2">{subtitle}</p>
            )}
            {showCount && images.length > 1 && (
              <div className="flex items-center gap-2 text-white/90">
                <Grid3X3 className="size-4" />
                <span className="text-sm">{images.length} изображений</span>
              </div>
            )}
          </div>
        </div>

        {/* View button */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/90 hover:bg-white text-black"
          >
            <Eye className="size-4" />
          </Button>
        </div>
      </div>

      <FullscreenGallery
        images={images}
        title={title || 'Галерея изображений'}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        currentIndex={currentImageIndex}
      />
    </div>
  )
}
