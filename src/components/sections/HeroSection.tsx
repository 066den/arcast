import { cn } from '@/lib/utils'
import Image from 'next/image'

interface HeroSectionProps {
  title?: string | null
  description?: string | null
  image?: string
  videoUrl?: string
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
        'relative rounded-3xl overflow-hidden mx-2 mb-4 xl:m-4',
        image && 'lg:max-h-[700px] max-h-[350px]'
      )}
    >
      {videoUrl && (
        <video
          src={videoUrl}
          controls={false}
          muted
          loop
          autoPlay
          playsInline
          poster="/assets/images/heronew.png"
          className="w-full h-full object-cover"
        />
      )}
      {image && (
        <Image
          src={image}
          alt={title || ''}
          width={1400}
          height={700}
          className="w-full h-full object-cover animate-fade-in"
          priority
        />
      )}

      {title && (
        <div className="absolute inset-0 flex flex-col lg:gap-4 gap-2 items-center justify-center p-4 bg-black/80">
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
