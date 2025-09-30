'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback, useEffect } from 'react'

export const SCROLL_TARGETS = {
  BOOKING: {
    SERVICES: 'services',
    STUDIOS: 'studios',
    FORM: 'form',
  },
  SERVICES: {
    FULL: 'full-cycle',
    REELS: 'reels',
    MEDIA: 'media',
  },
  CASE_STUDIES: {
    LIST: 'list',
    DETAILS: 'details',
  },
} as const

export type ScrollTarget =
  (typeof SCROLL_TARGETS)[keyof typeof SCROLL_TARGETS][keyof (typeof SCROLL_TARGETS)[keyof typeof SCROLL_TARGETS]]

interface UseScrollNavigationOptions {
  scrollDelay?: number
  scrollBehavior?: ScrollBehavior
  scrollBlock?: ScrollLogicalPosition
}

export const useScrollNavigation = (
  options: UseScrollNavigationOptions = {}
) => {
  const router = useRouter()
  const pathname = usePathname()

  const {
    scrollDelay = 100,
    scrollBehavior = 'smooth',
    scrollBlock = 'start',
  } = options

  const scrollToId = useCallback(
    (id: string) => {
      if (typeof window !== 'undefined') {
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({
            behavior: scrollBehavior,
            block: scrollBlock,
          })
        }
      }
    },
    [scrollBehavior, scrollBlock]
  )

  const navigateWithScroll = useCallback(
    (route: string, sectionId: string) => {
      if (pathname === route) {
        scrollToId(sectionId)
      } else {
        router.push(`${route}#${sectionId}`)
      }
    },
    [pathname, router, scrollToId]
  )

  const shouldScrollTo = useCallback((sectionId: string) => {
    if (typeof window !== 'undefined') {
      return window.location.hash.replace('#', '') === sectionId
    }
    return false
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '')
      if (hash) {
        setTimeout(() => {
          scrollToId(hash)
        }, scrollDelay)
      }
    }
  }, [pathname, scrollToId, scrollDelay])

  return {
    navigateWithScroll,
    scrollToId,
    shouldScrollTo,
  }
}

export const useMultiScrollNavigation = (
  options: UseScrollNavigationOptions = {}
) => {
  const router = useRouter()
  const pathname = usePathname()

  const {
    scrollDelay = 100,
    scrollBehavior = 'smooth',
    scrollBlock = 'start',
  } = options

  const scrollToId = useCallback(
    (id: string) => {
      if (typeof window !== 'undefined') {
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({
            behavior: scrollBehavior,
            block: scrollBlock,
          })
        }
      }
    },
    [scrollBehavior, scrollBlock]
  )

  const navigateWithScroll = useCallback(
    (route: string, sectionId: string) => {
      if (pathname === route) {
        // Already on the target page → just scroll
        scrollToId(sectionId)
      } else {
        // Navigate to page and wait for render
        router.push(`${route}#${sectionId}`)
      }
    },
    [pathname, router, scrollToId]
  )

  const shouldScrollTo = useCallback((sectionId: string) => {
    if (typeof window !== 'undefined') {
      return window.location.hash.replace('#', '') === sectionId
    }
    return false
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '')
      if (hash) {
        setTimeout(() => {
          scrollToId(hash)
        }, scrollDelay)
      }
    }
  }, [pathname, scrollToId, scrollDelay])

  return {
    navigateWithScroll,
    scrollToId,
    shouldScrollTo,
  }
}
