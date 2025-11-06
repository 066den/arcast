import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from '@/components/ui/dropzone'
import { MAX_FILE_SIZE } from '@/lib/constants'
import { ImageCropper } from './ImageCropper'

import { toast } from 'sonner'
import Image from 'next/image'
import { UploadIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { validateFile } from '@/lib/validate'
import { ASPECT_RATIOS } from '@/lib/constants'

interface ImageEditableProps {
  src?: string
  alt?: string
  onUpload?: (file: File) => void
  aspectRatio?: number
  showCrop?: boolean
  className?: string
  size?: 'small' | 'medium' | 'large'
}

const ImageEditable = ({
  src,
  alt,
  onUpload,
  aspectRatio,
  showCrop = true,
  className,
  size = 'medium',
}: ImageEditableProps) => {
  const [cropImage, setCropImage] = useState<string | null>(null)
  const [isCropping, setIsCropping] = useState(false)
  const [imgUrl, setImgUrl] = useState<string>(src || '')

  // Update imgUrl when src prop changes
  useEffect(() => {
    if (src) {
      setImgUrl(src)
    } else {
      setImgUrl('')
    }
  }, [src])

  const handleDrop = async (files: File[]) => {
    const file = files[0]
    const validation = validateFile(file)
    if (validation) {
      toast.error(validation)
      return
    }

    if (showCrop) {
      // Create URL for preview
      const imageUrl = URL.createObjectURL(file)
      setCropImage(imageUrl)
      setIsCropping(true)
    } else {
      onSelectFile(file)
    }
  }

  const handleCropComplete = async (croppedFile: File) => {
    onSelectFile(croppedFile)
    setIsCropping(false)
    setCropImage(null)
  }

  const handleCropCancel = () => {
    setIsCropping(false)
    if (cropImage) {
      URL.revokeObjectURL(cropImage)
      setCropImage(null)
    }
  }

  const onSelectFile = (file: File) => {
    const imgUrl = URL.createObjectURL(file)
    setImgUrl(imgUrl)
    onUpload?.(file)
  }

  const handleError = (error: Error) => {
    toast.error(error.message)
  }

  return (
    <div className={className}>
      <Dropzone
        onDrop={handleDrop}
        accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
        maxSize={MAX_FILE_SIZE.IMAGE}
        onError={handleError}
        className={`${aspectRatio === ASPECT_RATIOS.SQUARE ? 'aspect-[1/1]' : aspectRatio === ASPECT_RATIOS.LANDSCAPE ? 'aspect-[16/9]' : aspectRatio === ASPECT_RATIOS.PORTRAIT ? 'aspect-[3/4]' : 'aspect-[1/1]'} ${size === 'small' ? 'w-[200px]' : size === 'medium' ? 'w-[300px]' : 'w-[400px]'}`}
      >
        <DropzoneEmptyState>
          <div className="flex flex-col w-full items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <UploadIcon size={20} />
            </div>
            <div className="text-left">
              <p className="font-medium text-sm">Upload a file</p>
              <p className="text-muted-foreground text-xs">
                Drag and drop or click to upload <br /> between 1.00KB and
                5.00MB
              </p>
            </div>
          </div>
        </DropzoneEmptyState>
        {imgUrl && (
          <Image
            alt={alt || 'Preview'}
            className="absolute top-0 left-0 h-full w-full object-cover"
            fill
            src={imgUrl}
            priority
          />
        )}
        <DropzoneContent />
      </Dropzone>

      {isCropping && cropImage && (
        <ImageCropper
          src={cropImage}
          aspectRatio={aspectRatio}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  )
}

export default ImageEditable
