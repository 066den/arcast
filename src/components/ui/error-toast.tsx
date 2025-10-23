'use client'

import { useState, useEffect } from 'react'
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ErrorToastProps {
  message: string
  type?: 'error' | 'success' | 'warning' | 'info'
  duration?: number
  onClose?: () => void
  className?: string
}

export function ErrorToast({
  message,
  type = 'error',
  duration = 5000,
  onClose,
  className,
}: ErrorToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onClose?.(), 300) // Wait for animation
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose?.(), 300)
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-red-600" />
    }
  }

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-red-50 border-red-200 text-red-800'
    }
  }

  if (!isVisible) return null

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 max-w-md w-full mx-4',
        'border rounded-lg shadow-lg p-4',
        'transform transition-all duration-300 ease-in-out',
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
        getStyles(),
        className
      )}
    >
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-5">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded-md hover:bg-black/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// Hook for managing error toasts
export function useErrorToast() {
  const [toasts, setToasts] = useState<
    Array<{
      id: string
      message: string
      type: 'error' | 'success' | 'warning' | 'info'
      duration?: number
    }>
  >([])

  const addToast = (
    message: string,
    type: 'error' | 'success' | 'warning' | 'info' = 'error',
    duration?: number
  ) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { id, message, type, duration }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const showError = (message: string, duration?: number) =>
    addToast(message, 'error', duration)
  const showSuccess = (message: string, duration?: number) =>
    addToast(message, 'success', duration)
  const showWarning = (message: string, duration?: number) =>
    addToast(message, 'warning', duration)
  const showInfo = (message: string, duration?: number) =>
    addToast(message, 'info', duration)

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <ErrorToast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )

  return {
    showError,
    showSuccess,
    showWarning,
    showInfo,
    ToastContainer,
  }
}
