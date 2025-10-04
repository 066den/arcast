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
import ReactPlayer from 'react-player'

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
  xl: 'max-w-xl',
  full: 'max-w-full mx-4',
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  showCloseButton = true,
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
          'max-h-[calc(100vh-40px)] pt-4',
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
  poster,
  title,
  onClose,
}: VideoModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={title || 'Video Player'}
      hideTitle={!title}
      contentClassName="overflow-hidden"
      className="p-0 aspect-video"
    >
      <ReactPlayer
        src={videoUrl}
        style={{ width: '100%', height: '100%', aspectRatio: '16/9' }}
        controls
        autoPlay
        preload="auto"
      />
    </Modal>
  )
}
