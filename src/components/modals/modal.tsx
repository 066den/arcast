'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as any

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  className?: string
  contentClassName?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  hideTitle?: boolean
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-4xl sm:rounded-3xl',
  full: 'max-w-full mx-4',
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,

  closeOnOverlayClick = true,
  className,
  contentClassName,
  hideTitle = false,
  size = 'md',
}: ModalProps) {
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          sizeClasses[size],
          'max-h-[calc(100vh-40px)] pt-4 overflow-hidden',
          contentClassName
        )}
        onPointerDownOutside={
          closeOnOverlayClick ? undefined : e => e.preventDefault()
        }
        onEscapeKeyDown={
          closeOnOverlayClick ? undefined : e => e.preventDefault()
        }
      >
        {title && (
          <DialogHeader className="px-4">
            <DialogTitle className={cn(hideTitle && 'opacity-0')}>
              {title}
            </DialogTitle>

            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
        )}

        <div className={cn('px-4 flex-1 overflow-y-auto', className)}>
          {children}
        </div>

        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  )
}

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  loading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      contentClassName="p-4"
      footer={
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} disabled={loading}>
            {loading ? 'Loading...' : confirmText}
          </Button>
        </div>
      }
    >
      <div />
    </Modal>
  )
}

interface VideoModalProps {
  isOpen: boolean
  videoUrl: string
  poster?: string
  title?: string
  onClose: () => void
}

export function VideoModal({
  isOpen,
  videoUrl,
  title,
  onClose,
}: VideoModalProps) {
  const [playing, setPlaying] = React.useState(false)
  const [finalVideoUrl, setFinalVideoUrl] = React.useState<string>('')

  React.useEffect(() => {
    if (!videoUrl) {
      setFinalVideoUrl('')
      return
    }

    // Check if URL contains MinIO/S3 path and needs fixing
    if (videoUrl.includes('localhost:9000')) {
      // Remove arcast-s3 bucket prefix if present, use samples bucket directly
      const fixedUrl = videoUrl.replace(/\/arcast-s3\//, '/samples/')
      setFinalVideoUrl(fixedUrl)
      return
    }

    // If it's already a full URL, use as is
    if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
      setFinalVideoUrl(videoUrl)
      return
    }

    // Extract filename from S3 path like "samples/d2dc3124-93f9-4dc7-914b-3e6697878e08.mp4"
    // or "arcast-s3/samples/..." or "arcast-s3/videos/..."
    const match = videoUrl.match(
      /(?:arcast-s3\/)?(?:samples|videos)\/([^/]+\.mp4)/
    )
    if (match) {
      const fileName = match[1]
      // Construct S3 URL using MinIO public endpoint
      const s3Url = `http://localhost:9000/samples/${fileName}`
      setFinalVideoUrl(s3Url)
    } else if (videoUrl.startsWith('/')) {
      // Local path, use as is
      setFinalVideoUrl(videoUrl)
    } else {
      // Use as is for any other format
      setFinalVideoUrl(videoUrl)
    }
  }, [videoUrl])

  React.useEffect(() => {
    if (isOpen && finalVideoUrl) {
      // Small delay to ensure modal is fully rendered
      const timer = setTimeout(() => setPlaying(true), 100)
      return () => clearTimeout(timer)
    } else {
      setPlaying(false)
    }
  }, [isOpen, finalVideoUrl])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={title || 'Video Player'}
      hideTitle={!title}
      contentClassName="overflow-hidden p-0 pt-4"
      className="w-full h-auto px-0"
    >
      {finalVideoUrl ? (
        <div
          className="relative w-full video-modal-container"
          style={{
            aspectRatio: '16/9',
            minHeight: '400px',
            maxHeight: '80vh',
          }}
        >
          <ReactPlayer
            url={finalVideoUrl}
            controls
            playing={playing}
            width="100%"
            height="100%"
          />
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          No video URL provided
        </div>
      )}
    </Modal>
  )
}
