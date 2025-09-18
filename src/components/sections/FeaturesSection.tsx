import Image from 'next/image'
import { Button } from '../ui/button'
import { ChevronRightIcon } from 'lucide-react'

const FeaturesSection = () => {
  return (
    <section className="px-8 py-16">
      <div className="container mx-auto flex gap-10">
        <Image
          src="/assets/images/features.webp"
          alt="Features"
          width={280}
          height={350}
          className="rounded-[2.5rem]"
        />

        <div className="flex-1 flex flex-col justify-between pb-2">
          <h2 className="text-[4rem] text-accent">
            Your personal content factory in Dubai
          </h2>
          <h3 className="text-[2.75rem]">
            We produce, edit, and publish your
            <br /> podcasts and Reels — from{' '}
            <span className="text-accent">idea</span> to audience{' '}
            <span className="text-accent">growth</span>.
          </h3>
          <div className="flex gap-4">
            <Button
              size="lg"
              variant="primary"
              className="group"
              icon={<ChevronRightIcon className="size-7" />}
            >
              View Packages
            </Button>
            <Button
              size="lg"
              variant="primary"
              className="group"
              icon={<ChevronRightIcon className="size-7" />}
            >
              Book a Call
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
