import { PackageWithServices } from '@/types'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { ChevronRightIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useBooking } from '@/hooks/storeHooks/useBooking'
import {
  SCROLL_TARGETS,
  useScrollNavigation,
} from '@/hooks/useScrollNavigation'
import { ROUTES } from '@/lib/constants'

interface PackageCardProps {
  package: PackageWithServices
}

const PackageCard = ({ package: packageData }: PackageCardProps) => {
  const { name, basePrice, currency, services } = packageData
  const { selectPackage, selectPackageId } = useBooking()
  const { navigateWithScroll } = useScrollNavigation()
  const pathname = usePathname()
  const isBooking = pathname === ROUTES.BOOKING
  const isActive = selectPackageId === packageData.id

  const handleBookNow = () => {
    selectPackage(packageData.id)
    if (!isBooking) {
      navigateWithScroll(ROUTES.BOOKING, SCROLL_TARGETS.BOOKING.SERVICES)
    }
  }

  return (
    <Card className="h-full min-h-[380px] bg-primary text-white rounded-3xl font-nunito-sans">
      <CardHeader className="border-b-1 font-bold text-xl border-white pb-2">
        <div>{name}</div>
        <div className={cn('text-neutral-200')}>
          {`${parseFloat(basePrice.toString())} ${currency}`}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p>Includes:</p>
        {services && (
          <ul className="list-disc mx-6">
            {services.map(service => (
              <li key={service.id}>
                {service.quantity} {service.name}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <CardFooter className="justify-center">
        <Button
          size="lg"
          variant="primary"
          icon={
            !isBooking ? <ChevronRightIcon className="size-7" /> : undefined
          }
          className="group bg-neutral-800"
          onClick={handleBookNow}
        >
          {isBooking ? (isActive ? 'Picked' : 'Pick this') : 'Book Now'}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default PackageCard
