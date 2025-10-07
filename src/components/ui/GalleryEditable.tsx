import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from '@/components/ui/dropzone'
import { MAX_FILE_SIZE } from '@/lib/constants'
import { ImageCropper } from './ImageCropper'

import { toast } from 'sonner'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { validateFile } from '@/lib/validate'

interface GalleryEditableProps {
  onUpload?: (file: File) => void
  aspectRatio?: number
  showCrop?: boolean
  className?: string
}

const GalleryEditable = ({
  onUpload,
  aspectRatio = 1,
  showCrop = true,
  className,
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
      <Dropzone
        onDrop={handleDrop}
        accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
        maxSize={MAX_FILE_SIZE.IMAGE}
        onError={handleError}
      >
        <DropzoneEmptyState>
          <div className="flex items-center gap-4 justify-center">
            <PlusIcon className="size-8" onClick={() => setIsCropping(true)} />
          </div>
        </DropzoneEmptyState>
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

export default GalleryEditable
