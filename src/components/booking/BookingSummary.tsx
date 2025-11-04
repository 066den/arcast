'use client'
import { useMemo } from 'react'
import { formatDateDubai } from '@/utils/dateFormat'
import { formatTimeRange } from '@/utils/time'
import { Card, CardContent } from '../ui/card'
import { ServiceType, Studio } from '../../types'
import { Package } from '../../types'
import { AdditionalService } from '../../types'
import { useBooking } from '@/hooks/storeHooks/useBooking'

interface BookingSummaryProps {
  selectedDate: Date | undefined
  selectedTime: string
  duration?: number | null
  guests: number
  selectedStudio: string
  selectedService?: string
  selectedPackage?: string
  selectedAdditionalServices: Array<{ id: string; quantity: number }>
  initialServiceTypes: ServiceType[]
  studios: Studio[]
  packages?: Package[]
  additionalServices: AdditionalService[]
}

export function BookingSummary({
  selectedDate,
  selectedTime,
  duration,
  guests,
  selectedStudio,
  selectedService,
  selectedPackage,
  selectedAdditionalServices,
  studios,
  packages,
  initialServiceTypes,
  additionalServices,
}: BookingSummaryProps) {
  const { selectServiceTypeSlug } = useBooking()

  const services = useMemo(() => {
    const selectedType = initialServiceTypes.find(
      type => selectServiceTypeSlug === type.slug
    )
    return selectedType?.services || []
  }, [initialServiceTypes, selectServiceTypeSlug])

  const calculateTotal = () => {
    let total = 0

    if (selectedPackage && packages) {
      const pkg = packages.find(p => p.id === selectedPackage)
      if (pkg) {
        total += parseFloat(pkg.basePrice.toString()) * (duration || 1)
      }
    }

    if (selectedService && services) {
      const service = services.find(s => s.id === selectedService)
      if (service) {
        total += parseFloat(service.price?.toString() || '0') * (duration || 1)
      }
    }

    selectedAdditionalServices.forEach(service => {
      const selectedService = additionalServices.find(s => s.id === service.id)
      if (selectedService && selectedService.price) {
        const price =
          typeof selectedService.price === 'number'
            ? selectedService.price
            : parseFloat(selectedService.price.toString())
        total += price * (service.quantity || 1)
      }
    })

    return total
  }

  const formatDate = (dateString: Date | undefined) => {
    if (!dateString) return ''
    return formatDateDubai(new Date(dateString))
  }

  if (!selectedAdditionalServices || !additionalServices) {
    return (
      <Card className="bg-muted">
        <CardContent>
          <p>Loading...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-muted">
      <CardContent className="space-y-4">
        {selectedStudio && (
          <div className="flex justify-between gap-2">
            <h4 className="text-2xl font-medium mb-2">Selected Studio</h4>
            <p className="text-sm">
              {studios.find(s => s.id === selectedStudio)?.name}
            </p>
          </div>
        )}

        {selectedPackage && packages && (
          <div className="p-3 bg-slate-800 rounded-lg">
            <h4 className="font-medium mb-2 text-white">Selected Package</h4>
            <p className="text-sm text-slate-300">
              {packages.find(p => p.id === selectedPackage)?.name}
            </p>
            <p className="text-sm text-slate-300">
              Price:{' '}
              {packages
                .find(p => p.id === selectedPackage)
                ?.basePrice?.toString()}{' '}
              AED/hour
            </p>
          </div>
        )}

        {selectedDate && selectedTime && (
          <div className="p-3 bg-slate-800 rounded-lg">
            <h4 className="font-medium mb-2 text-white">Session Details</h4>
            <p className="text-sm text-slate-300">{formatDate(selectedDate)}</p>
            <p className="text-sm text-slate-300">
              Time: {formatTimeRange(selectedTime, duration || 1)}
            </p>
            <p className="text-sm text-slate-300">Duration: ({duration}h)</p>
            <p className="text-sm text-slate-300">Guests: {guests}</p>
          </div>
        )}

        {selectedAdditionalServices.length > 0 && (
          <div className="p-3 bg-slate-800 rounded-lg">
            <h4 className="font-medium mb-2 text-white">Additional Services</h4>
            <ul className="text-sm text-slate-300 space-y-1">
              {selectedAdditionalServices.map(({ id, quantity }) => {
                const service = additionalServices.find(s => s.id === id)
                if (!service) return null

                const price =
                  typeof service.price === 'number'
                    ? service.price
                    : parseFloat(service.price.toString())
                const totalPrice = price * (quantity || 1)

                return (
                  <li key={id} className="flex justify-between items-center">
                    <span>{service.name}</span>
                    <span className="font-medium">
                      {totalPrice} {service.currency}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        <div className="border-t pt-4 space-y-2">
          {(selectedPackage || selectedService) && (
            <div className="space-y-1">
              {selectedPackage && packages && (
                <div className="flex justify-between">
                  <span>
                    {packages.find(p => p.id === selectedPackage)?.name} (
                    {duration}h)
                  </span>
                  <span className="font-medium">
                    {parseFloat(
                      packages
                        .find(p => p.id === selectedPackage)
                        ?.basePrice.toString() || '0'
                    ) * (duration || 1)}{' '}
                    AED
                  </span>
                </div>
              )}
              {selectedService && services && (
                <div className="flex justify-between text-xl">
                  <span>
                    {services.find(s => s.id === selectedService)?.name}
                    {duration ? `(${duration}h)` : ''}
                  </span>
                  <span className="font-medium">
                    {parseFloat(
                      services
                        .find(s => s.id === selectedService)
                        ?.price?.toString() || '0'
                    ) * (duration || 1)}{' '}
                    AED
                  </span>
                </div>
              )}
              {selectedAdditionalServices.length > 0 && (
                <div className="space-y-1">
                  {selectedAdditionalServices.map(({ id, quantity }) => {
                    const service = additionalServices.find(s => s.id === id)
                    return service ? (
                      <div key={id} className="flex justify-between text-sm">
                        <span className="text-slate-600">
                          {service.name}{' '}
                          {quantity && quantity > 1 ? `(x${quantity})` : ''}
                        </span>
                        <span className="font-medium">
                          {Number(service.price) * (quantity || 1)}{' '}
                          {service.currency}
                        </span>
                      </div>
                    ) : null
                  })}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-center text-lg font-semibold pt-2 border-t">
            <span>Total Cost:</span>
            <span className="text-accent">{calculateTotal()} AED</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            *Final price may vary based on actual duration
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
