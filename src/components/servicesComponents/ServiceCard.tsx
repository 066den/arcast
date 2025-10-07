import { useMemo } from 'react'
import { Service } from '@/types'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { ChevronRightIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useBooking } from '@/hooks/storeHooks/useBooking'
import { ROUTES } from '@/lib/constants'
import {
  useScrollNavigation,
  SCROLL_TARGETS,
} from '@/hooks/useScrollNavigation'

interface ServiceCardProps {
  service: Service
}

const ServiceCard = ({ service }: ServiceCardProps) => {
  const { name, includes, price, isPopular, currency, serviceType } = service
  const { selectService, selectServiceId } = useBooking()
  const pathname = usePathname()
  const isBooking = pathname === ROUTES.BOOKING
  const isActive = selectServiceId === service.id
  const { navigateWithScroll } = useScrollNavigation()

  const unit = useMemo(() => {
    switch (serviceType?.slug) {
      case 'podcast':
        return 'hour'
      default:
        return ''
    }
  }, [serviceType])

  const handleBookNow = () => {
    selectService(service.id)
    if (!isBooking) {
      navigateWithScroll(ROUTES.BOOKING, SCROLL_TARGETS.BOOKING.SERVICES)
    }
  }

  return (
    <Card className="h-full min-h-[380px] bg-primary text-white rounded-3xl font-nunito-sans">
      <CardHeader className="border-b-1 font-bold text-xl border-white pb-2">
        <div>{name}</div>
        <div className={cn(isPopular ? 'text-accent' : 'text-neutral-200')}>
          <span>{`${parseFloat(price.toString())} ${currency}`}</span>
          {unit ? (
            <span className="text-base font-normal">{`/${unit}`}</span>
          ) : (
            ''
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p>Includes:</p>
        {includes && (
          <ul className="list-disc mx-6">
            {includes.map((include, index) => (
              <li key={index} className="leading-tight">
                {include}
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
          className={cn(
            'group bg-neutral-800',
            isActive && isBooking && 'bg-accent'
          )}
          onClick={handleBookNow}
        >
          {isBooking ? (isActive ? 'Picked' : 'Pick this') : 'Book Now'}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default ServiceCard
