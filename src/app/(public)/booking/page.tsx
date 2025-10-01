import { getStudios } from '@/services/studioServices'
import { getPackages, getServiceTypes } from '@/services/servicesServices'
import BookingForm from '@/components/booking/BookingForm'
import ChooseServiceOrPackage from '@/components/booking/ChooseServiceOrPackage'

export default async function BookingPage() {
  const [initialServiceTypes, initialPackages] = await Promise.all([
    getServiceTypes(),
    getPackages(),
  ])

  const [studios] = await Promise.all([getStudios()])

  return (
    <>
      <section className="lg:py-16 py-10">
        <div className="text-center">
          <h1 className="text-accent mb-8">Book Your Studio Session</h1>
          <h3 className="">
            Choose a <span className="text-accent">service</span> you need or a{' '}
            <span className="text-accent">package</span>, and{' '}
            <span className="text-accent">additional services</span>. Our
            <span className="text-accent">professional team</span> will ensure
            you have everything you need for a{' '}
            <span className="text-accent">successful recording</span>.
          </h3>
        </div>
      </section>
      <ChooseServiceOrPackage
        initialServiceTypes={initialServiceTypes}
        initialPackages={initialPackages}
      />
      <BookingForm
        initialStudios={studios}
        //initialPackages={initialPackages}
        initialServices={[]}
      />
    </>
  )
}
