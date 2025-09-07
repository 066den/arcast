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
  aspectRatio?: number
  onCropComplete?: (croppedFile: File) => void
  onCancel?: () => void
}

export const ImageCropper = ({
  src,
  aspectRatio = 1,
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
      const crop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 100,
          },
          aspectRatio,
          width,
          height
        ),
        width,
        height
      )
      setCrop(crop)
    },
    [aspectRatio]
  )

  const handleCropComplete = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) {
      return
    }

    try {
      const image = imgRef.current

      // Create canvas with the dimensions of the cropped image
      const croppedCanvas = document.createElement('canvas')
      const ctx = croppedCanvas.getContext('2d')

      if (!ctx) return

      croppedCanvas.width = completedCrop.width
      croppedCanvas.height = completedCrop.height

      // Draw the cropped part of the image
      ctx.drawImage(
        image,
        completedCrop.x,
        completedCrop.y,
        completedCrop.width,
        completedCrop.height,
        0,
        0,
        completedCrop.width,
        completedCrop.height
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
            Drag the corners to change the cropping area
          </p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={c => setCompletedCrop(c)}
            aspect={aspectRatio}
            className="max-w-full max-h-[60vh]"
          >
            <img
              ref={imgRef}
              alt="Crop me"
              src={src}
              style={{ maxHeight: '60vh', maxWidth: '100%' }}
              onLoad={onImageLoad}
            />
          </ReactCrop>

          <div className="flex gap-2">
            <Button onClick={handleCropComplete} disabled={!completedCrop}>
              Apply Crop
            </Button>
            <Button variant="outline" onClick={onCancel}>
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
