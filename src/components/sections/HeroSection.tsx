import { cn } from '@/lib/utils'
import Video from 'next-video'
import { Asset } from 'next-video/dist/assets.js'
import Image from 'next/image'

interface HeroSectionProps {
  title?: string | null
  description?: string | null
  image?: string
  videoUrl?: Asset
}

const HeroSection = ({
  title,
  description,
  image,
  videoUrl,
}: HeroSectionProps) => {
  return (
    <div
      className={cn(
        'relative rounded-3xl overflow-hidden  m-4',
        image &&
          'max-h-[700px] before:content-[""] before:absolute before:inset-0 before:bg-black/80'
      )}
    >
      {videoUrl && (
        <Video
          src={videoUrl}
          controls={false}
          muted
          loop
          autoPlay
          playsInline
          poster="/assets/images/heronew.png"
        />
      )}
      {image && (
        <Image
          src={image}
          alt={title || ''}
          width={1400}
          height={700}
          className="w-full h-full object-cover"
          priority
        />
      )}

      {title && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <h1 className="text-white text-center animate-fade-in-up">{title}</h1>
          {description && (
            <h3 className="text-accent text-center animate-fade-in-up-delayed">
              {description}
            </h3>
          )}
        </div>
      )}
    </div>
  )
}

export default HeroSection
