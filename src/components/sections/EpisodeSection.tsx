import Image from 'next/image'
import ServiceButton from '../ui/ServiceButton'
const EpisodeSection = () => {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="section-title">what we&apos;ve made</div>
      <div className="grid grid-cols-1 lg:grid-cols-5">
        <div className="lg:col-span-4">
          <h2 className="text-6xl mb-4">
            See our work in <span className="text-accent">action</span>
          </h2>
          <h2 className="text-6xl flex items-center gap-3">
            <Image
              src="/assets/images/pre-explore.png"
              alt="Explore the latest jewels"
              width={105}
              height={48}
            />
            Explore the latest <span className="text-accent">jewels</span>
          </h2>
        </div>
        <p className="text-secondary">
          Dive into handpicked examples of our work regarding different types of
          media and content creation.
        </p>
      </div>

      <div className="flex gap-4">
        <div>
          <ServiceButton title="Podcast production" />
        </div>
      </div>
    </section>
  )
}

export default EpisodeSection
