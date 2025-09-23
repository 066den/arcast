'use client'

import { useState, useCallback } from 'react'

interface PreloaderState {
  isLoading: boolean
  text?: string
  variant?: 'spinner' | 'dots' | 'pulse' | 'wave'
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function usePreloader(
  initialState: PreloaderState = { isLoading: false }
) {
  const [state, setState] = useState<PreloaderState>(initialState)

  const show = useCallback((options?: Partial<PreloaderState>) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      ...options,
    }))
  }, [])

  const hide = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: false,
    }))
  }, [])

  const update = useCallback((options: Partial<PreloaderState>) => {
    setState(prev => ({
      ...prev,
      ...options,
    }))
  }, [])

  return {
    ...state,
    show,
    hide,
    update,
  }
}

// Hook for async operations with automatic loading state
export function useAsyncPreloader() {
  const preloader = usePreloader()

  const execute = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      options?: Partial<PreloaderState>
    ): Promise<T> => {
      try {
        preloader.show(options)
        const result = await asyncFn()
        return result
      } finally {
        preloader.hide()
      }
    },
    [preloader]
  )

  return {
    ...preloader,
    execute,
  }
}
