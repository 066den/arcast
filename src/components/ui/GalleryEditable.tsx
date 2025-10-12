import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from '@/components/ui/dropzone'
import { MAX_FILE_SIZE } from '@/lib/constants'
import { ImageCropper } from './ImageCropper'

import { toast } from 'sonner'
import { PlusIcon, X } from 'lucide-react'
import { useState } from 'react'
import { validateFile } from '@/lib/validate'
import Image from 'next/image'
import { Button } from './button'

interface GalleryEditableProps {
  onUpload?: (file: File) => void
  aspectRatio?: number
  showCrop?: boolean
  className?: string
  images?: string[]
  onDelete: (image: string) => void
}

const GalleryEditable = ({
  onUpload,
  aspectRatio = 1,
  showCrop = true,
  className,
  images,
  onDelete,
}: GalleryEditableProps) => {
  const [cropImage, setCropImage] = useState<string | null>(null)
  const [isCropping, setIsCropping] = useState(false)

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
    onUpload?.(file)
  }

  const handleError = (error: Error) => {
    toast.error(error.message)
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-3 gap-2">
        {images?.map(image => (
          <div
            key={image}
            className="relative aspect-[4/3] rounded-md overflow-hidden"
          >
            <Image
              key={image}
              src={image}
              alt="Gallery"
              fill
              sizes="100px"
              className="object-cover"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-0 right-0 z-10"
              onClick={() => onDelete(image)}
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
        <Dropzone
          onDrop={handleDrop}
          accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
          maxSize={MAX_FILE_SIZE.IMAGE}
          onError={handleError}
        >
          <DropzoneEmptyState>
            <div className="flex items-center gap-4 justify-center">
              <PlusIcon
                className="size-8"
                onClick={() => setIsCropping(true)}
              />
            </div>
          </DropzoneEmptyState>
          <DropzoneContent />
        </Dropzone>
      </div>

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

export default GalleryEditable
