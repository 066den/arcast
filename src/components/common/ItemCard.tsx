import Image from 'next/image'
import { AvatarEmpty } from '../ui/avatar-empty'

interface ItemCardProps {
  name?: string | null
  description?: string | null
  imageUrl?: string | null
}

export default function ItemCard({
  name,
  description,
  imageUrl,
}: ItemCardProps) {
  return (
    <div className="bg-white flex flex-col flex-1 items-center">
      <div className="aspect-[1/1] w-full max-w-[160px] relative overflow-hidden rounded-xl group transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name || 'Staff member'}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <AvatarEmpty />
        )}
      </div>

      <div className="sm:p-4 py-2 sm:text-xl text-base text-center font-nunito-sans leading-none">
        {name && <h4 className="font-medium text-accent mb-2">{name}</h4>}
        {description && <p>{description}</p>}
      </div>
    </div>
  )
}
