import { useMemo } from 'react'
import { Service } from '@/types'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { ChevronRightIcon } from 'lucide-react'

interface ServiceCardProps {
  service: Service
}

const ServiceCard = ({ service }: ServiceCardProps) => {
  const { name, includes, price, isPopular, currency, type } = service

  const unit = useMemo(() => {
    switch (type) {
      case 'podcast':
        return 'hour'
      default:
        return ''
    }
  }, [type])

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
          icon={<ChevronRightIcon className="size-7" />}
          className="group bg-neutral-800"
        >
          Book Now
        </Button>
      </CardFooter>
    </Card>
  )
}

export default ServiceCard
