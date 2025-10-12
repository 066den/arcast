import { getStudios } from '@/services/studioServices'
import {
  getAdditionalServices,
  getPackages,
  getServiceTypes,
} from '@/services/servicesServices'
import BookingForm from '@/components/booking/BookingForm'
import ChooseServiceOrPackage from '@/components/booking/ChooseServiceOrPackage'

export default async function BookingPage() {
  const [initialServiceTypes, initialPackages, initialAdditionalServices] =
    await Promise.all([
      getServiceTypes(),
      getPackages(),
      getAdditionalServices(),
    ])

  const [studios] = await Promise.all([getStudios()])

  return (
    <>
      <section className="py-16">
        <div className="text-center">
          <h1 className="text-accent mb-8">Choose the services you need</h1>
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
        initialAdditionalServices={initialAdditionalServices}
        initialPackages={initialPackages}
        initialServiceTypes={initialServiceTypes}
      />
    </>
  )
}
