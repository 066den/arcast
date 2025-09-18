import Link from 'next/link'
import { aboutFeatures } from '@/lib/config'

const AboutSection = () => {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="section-title">why arcast</div>
      <div className="grid grid-cols-1 xl:grid-cols-4">
        <div className="max-w-2xs">
          <div className="text-7xl font-medium py-4">40K+</div>
          <p className="text-secondary">
            and counting hours of
            <br /> production already completed successfully.
          </p>
        </div>
        <h3 className="text-[2.75rem] lg:col-span-3 max-w-5xl lg:px-10">
          We provided solid technical and creative background for the talents.
          <br />
          All you need is just to bring your ideas{' '}
          <span className="text-accent">and we will do the rest!</span>
        </h3>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {aboutFeatures.map(feature => (
          <div
            key={feature.title}
            className="grid grid-rows-2 overflow-hidden rounded-3xl transition-all hover:shadow-md"
          >
            <div
              className="flex flex-col justify-end text-white font-nunito-sans font-bold text-xl tracking-tight px-6 py-4 bg-cover bg-center"
              style={{ backgroundImage: `url(${feature.image})` }}
            >
              {feature.title}
            </div>
            <div className="bg-muted p-6 pb-5">
              <p className="mb-4">{feature.description}</p>
              <Link
                href={feature.url}
                className="font-medium underline underline-offset-2"
              >
                Learn more
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default AboutSection
