import BookingForm from '@/components/booking/BookingForm'
import { getStudios, getPackages } from '@/services/studioServices'
import { getAdditionalServices } from '@/services/bookingServices'

export default async function BookingPage() {
  const [studios, packages, additionalServices] = await Promise.all([
    getStudios(),
    getPackages(),
    getAdditionalServices(),
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Book Your Studio Session
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Choose your preferred studio, package, and additional services. Our
            professional team will ensure you have everything you need for a
            successful recording.
          </p>
        </div>
        <BookingForm
          initialStudios={studios}
          //initialPackages={packages}
          initialServices={additionalServices}
        />
      </div>
    </div>
  )
}
