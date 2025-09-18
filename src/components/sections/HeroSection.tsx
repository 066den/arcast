import { cn } from '@/lib/utils'
import Video from 'next-video'
import { Asset } from 'next-video/dist/assets.js'
import Image from 'next/image'

interface HeroSectionProps {
  title?: string
  description?: string
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
    <section>
      <div
        className={cn(
          'relative rounded-3xl overflow-hidden',
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
            <h1 className="text-white text-center animate-fade-in-up">
              {title}
            </h1>
            {description && (
              <h3 className="text-[2.75em] text-accent text-center animate-fade-in-up-delayed">
                {description}
              </h3>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default HeroSection
