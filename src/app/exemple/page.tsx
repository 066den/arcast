import { PreloaderDemo } from '@/components/examples/PreloaderDemo'
import { GalleryDemo } from '@/components/examples/GalleryDemo'

export default function ExemplePage() {
  return (
    <div className="min-h-screen bg-white">
      <GalleryDemo />
      <PreloaderDemo />
    </div>
  )
}
