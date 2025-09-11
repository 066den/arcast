import Video from 'next-video'
import videoUrl from 'https://res.cloudinary.com/deuvbiekl/video/upload/v1747050218/desk_bgzsdy.mp4'
import { Button } from '../ui/button'
import { Play } from 'lucide-react'

const HeroVideo = () => {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="relative rounded-xl overflow-hidden">
        <Button variant="accent" className="absolute top-4 left-4 z-10">
          <Play className="w-4 h-4" />
          Start Booking
        </Button>
        <Video
          src={videoUrl}
          controls={false}
          muted
          loop
          className="rounded-xl"
          poster="/assets/images/heronew.png"
        />
      </div>
    </section>
  )
}

export default HeroVideo
