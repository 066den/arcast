import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from '@/components/ui/dropzone'
import { MAX_FILE_SIZE, SUCCESS_MESSAGES } from '@/lib/constants'
import { validateFile } from '@/utils/files'
import { ImageCropper } from './ImageCropper'

import { toast } from 'sonner'
import Image from 'next/image'
import { UploadIcon } from 'lucide-react'
import { useState } from 'react'

interface ImageEditableProps {
  src?: string
  alt?: string
  onUpload?: (file: File) => void
  aspectRatio?: number
  showCrop?: boolean
  className?: string
}

const ImageEditable = ({
  src,
  alt,
  onUpload,
  aspectRatio = 1,
  showCrop = true,
  className,
}: ImageEditableProps) => {
  const [cropImage, setCropImage] = useState<string | null>(null)
  const [isCropping, setIsCropping] = useState(false)

  const handleDrop = async (files: File[]) => {
    console.log(files)
    const file = files[0]
    const validation = validateFile(file)
    if (validation) {
      toast.error(validation)
      return
    }

    if (showCrop) {
      // Создаем URL для предварительного просмотра
      const imageUrl = URL.createObjectURL(file)
      setCropImage(imageUrl)
      setIsCropping(true)
    } else {
      await onUpload?.(file)
      toast.success(SUCCESS_MESSAGES.FILE.UPLOADED)
    }
  }

  const handleCropComplete = async (croppedFile: File) => {
    await onUpload?.(croppedFile)
    toast.success(SUCCESS_MESSAGES.FILE.UPLOADED)
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

  return (
    <div className={className}>
      <Dropzone
        onDrop={handleDrop}
        accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
        maxSize={MAX_FILE_SIZE.IMAGE}
      >
        <DropzoneEmptyState>
          <div className="flex w-full items-center gap-4 p-8">
            <div className="flex size-16 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <UploadIcon size={24} />
            </div>
            <div className="text-left">
              <p className="font-medium text-sm">Upload a file</p>
              <p className="text-muted-foreground text-xs">
                Drag and drop or click to upload
              </p>
            </div>
          </div>
        </DropzoneEmptyState>
        {src && (
          <div className="h-[102px] w-full">
            <Image
              alt={alt || 'Preview'}
              className="absolute top-0 left-0 h-full w-full object-cover"
              width={102}
              height={102}
              src={src}
              priority
            />
          </div>
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
