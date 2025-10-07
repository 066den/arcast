'use client'

import { useState, useEffect } from 'react'

const videoUrl =
  'https://res.cloudinary.com/deuvbiekl/video/upload/v1747050218/desk_bgzsdy.mp4'

interface VideoBackgroundProps {
  children: React.ReactNode
  fallbackImage?: string
  overlay?: boolean
  className?: string
}

const VideoBackground = ({
  children,
  fallbackImage = '/assets/images/heronew.png',
  overlay = true,
  className = '',
}: VideoBackgroundProps) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [isVideoError, setIsVideoError] = useState(false)
  const [shouldShowVideo, setShouldShowVideo] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (prefersReducedMotion) {
      setShouldShowVideo(false)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const isMobile = window.innerWidth < 768
    const isLowEndDevice =
      navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4

    if (isMobile || isLowEndDevice) {
      setShouldShowVideo(false)
    }
  }, [])

  const handleVideoLoad = () => {
    setIsVideoLoaded(true)
  }

  const handleVideoError = () => {
    setIsVideoError(true)
    setShouldShowVideo(false)
  }

  return (
    <div
      className={`relative min-h-screen flex items-center justify-center overflow-hidden ${className}`}
    >
      {shouldShowVideo && !isVideoError && (
        <div className="absolute inset-0 z-0">
          <video
            src={videoUrl}
            controls={false}
            muted
            loop
            autoPlay
            playsInline
            className={`w-full h-full object-cover transition-opacity duration-1000 ${
              isVideoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            poster={fallbackImage}
            onLoadedData={handleVideoLoad}
            onError={handleVideoError}
          />
          {overlay && (
            <div className="absolute inset-0 bg-black/40 hero-background"></div>
          )}
        </div>
      )}

      {(!shouldShowVideo || isVideoError) && (
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${fallbackImage})` }}
          />
          {overlay && (
            <div className="absolute inset-0 bg-black/40 hero-background"></div>
          )}
        </div>
      )}

      <div className="relative z-10 w-full">{children}</div>
    </div>
  )
}

export default VideoBackground
