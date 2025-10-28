'use client'

import { useCallback, useRef, useState } from 'react'
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from 'react-image-crop'
import { Button } from './button'
import { X } from 'lucide-react'

import 'react-image-crop/dist/ReactCrop.css'

interface ImageCropperProps {
  src: string
  aspectRatio?: number | undefined
  onCropComplete?: (croppedFile: File) => void
  onCancel?: () => void
}

export const ImageCropper = ({
  src,
  aspectRatio,
  onCropComplete,
  onCancel,
}: ImageCropperProps) => {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const imgRef = useRef<HTMLImageElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget

      if (aspectRatio !== undefined) {
        // Initialize with a centered crop for aspect ratio
        const crop = centerCrop(
          makeAspectCrop(
            {
              unit: '%',
              width: 90,
            },
            aspectRatio,
            width,
            height
          ),
          width,
          height
        )
        setCrop(crop)
      } else {
        // No aspect ratio - free crop
        const crop: Crop = {
          unit: '%',
          x: 5,
          y: 5,
          width: 90,
          height: 90,
        }
        setCrop(crop)
      }
    },
    [aspectRatio]
  )

  const handleReset = useCallback(() => {
    setCrop(undefined)
    setCompletedCrop(undefined)
  }, [])

  const handleCropComplete = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) {
      return
    }

    try {
      const image = imgRef.current

      // Calculate scale from rendered size to natural size
      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height

      // Account for device pixel ratio for sharper result
      const pixelRatio =
        typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1

      // Create canvas with the dimensions of the cropped image in natural pixels
      const croppedCanvas = document.createElement('canvas')
      const ctx = croppedCanvas.getContext('2d', { willReadFrequently: true })

      if (!ctx) return

      const cropWidth = Math.round(completedCrop.width * scaleX)
      const cropHeight = Math.round(completedCrop.height * scaleY)
      const cropX = Math.round(completedCrop.x * scaleX)
      const cropY = Math.round(completedCrop.y * scaleY)

      croppedCanvas.width = Math.max(1, Math.floor(cropWidth * pixelRatio))
      croppedCanvas.height = Math.max(1, Math.floor(cropHeight * pixelRatio))

      // Ensure drawing scales back down for display size
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      ctx.imageSmoothingQuality = 'high'

      // Fill with white background to avoid black background in JPEG
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, cropWidth, cropHeight)

      // Draw the cropped part of the image from the natural-sized coordinates
      ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      )

      // Convert canvas to Blob, then to File
      return new Promise<void>(resolve => {
        croppedCanvas.toBlob(
          blob => {
            if (blob) {
              const file = new File([blob], 'cropped-image.jpg', {
                type: 'image/jpeg',
              })
              onCropComplete?.(file)
            }
            resolve()
          },
          'image/jpeg',
          0.9
        )
      })
    } catch (error) {
      console.error('Error cropping image:', error)
    }
  }, [completedCrop, onCropComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg p-6">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 z-10"
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="mb-4">
          <h3 className="text-lg font-semibold">Image Cropping</h3>
          <p className="text-sm text-muted-foreground">
            Drag the corners or edges to resize the cropping area, or drag the
            entire area to move it
          </p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => {
              setCrop(percentCrop)
            }}
            onComplete={c => setCompletedCrop(c)}
            aspect={aspectRatio}
            className="max-w-full max-h-[60vh]"
            minWidth={20}
            minHeight={20}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              alt="Crop me"
              src={src}
              style={{ maxHeight: '60vh', maxWidth: '100%' }}
              onLoad={onImageLoad}
            />
          </ReactCrop>

          <div className="flex gap-2">
            <Button
              onClick={handleCropComplete}
              type="button"
              disabled={!completedCrop}
            >
              Apply Crop
            </Button>
            <Button variant="outline" onClick={handleReset} type="button">
              Reset
            </Button>
            <Button variant="outline" onClick={onCancel} type="button">
              Cancel
            </Button>
          </div>
        </div>

        {/* Hidden canvas for preview */}

        <canvas
          ref={previewCanvasRef}
          style={{
            display: 'none',
          }}
        />
      </div>
    </div>
  )
}

// Utility for previewing the crop
