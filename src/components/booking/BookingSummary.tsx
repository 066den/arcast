'use client'

import { formatDateDubai } from '@/utils/dateFormat'
import { formatTimeRange } from '@/utils/time'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { Studio } from '../../types'
import { StudioPackage } from '../../types'
import { AdditionalService } from '../../types'

interface BookingSummaryProps {
  selectedDate: Date | undefined
  selectedTime: string
  duration: number
  guests: number
  selectedStudio: string
  selectedPackage: string
  selectedServices: AdditionalService[]
  studios: Studio[]
  packages: StudioPackage[]
  additionalServices: AdditionalService[]
}

export function BookingSummary({
  selectedDate,
  selectedTime,
  duration,
  guests,
  selectedStudio,
  selectedPackage,
  selectedServices,
  studios,
  packages,
  additionalServices,
}: BookingSummaryProps) {
  const calculateTotal = () => {
    let total = 0

    if (selectedStudio && selectedPackage) {
      const studio = studios.find(s => s.id === selectedStudio)
      const pkg = packages.find(p => p.id === selectedPackage)

      if (studio && pkg) {
        total += parseFloat(pkg.price_per_hour.toString()) * duration
      }
    }

    selectedServices.forEach(service => {
      const selectedService = additionalServices.find(s => s.id === service.id)
      if (selectedService) {
        total += selectedService.price * (service.quantity || 1)
      }
    })

    return total
  }

  const formatDate = (dateString: Date | undefined) => {
    if (!dateString) return ''
    return formatDateDubai(new Date(dateString))
  }

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle>Booking Summary</CardTitle>
        <CardDescription>Review your selection</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedStudio && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <h4 className="font-medium mb-2 text-slate-900 dark:text-white">
              Selected Studio
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {studios.find(s => s.id === selectedStudio)?.name}
            </p>
          </div>
        )}

        {selectedPackage && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <h4 className="font-medium mb-2 text-slate-900 dark:text-white">
              Selected Package
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {packages.find(p => p.id === selectedPackage)?.name}
            </p>
          </div>
        )}

        {selectedDate && selectedTime && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <h4 className="font-medium mb-2 text-slate-900 dark:text-white">
              Session Details
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {formatDate(selectedDate)}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Time: {formatTimeRange(selectedTime, duration, 'Asia/Dubai')}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Duration: {duration} hour{duration > 1 ? 's' : ''}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Guests: {guests}
            </p>
          </div>
        )}

        {selectedServices.length > 0 && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <h4 className="font-medium mb-2 text-slate-900 dark:text-white">
              Additional Services
            </h4>
            <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
              {selectedServices.map(({ id, quantity }) => {
                const service = additionalServices.find(s => s.id === id)
                return service ? (
                  <li key={id} className="flex justify-between items-center">
                    <span>{service.name}</span>
                    <span className="font-medium">
                      {service.price * (quantity || 1)} {service.currency}
                    </span>
                  </li>
                ) : null
              })}
            </ul>
          </div>
        )}

        <div className="border-t pt-4">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total Cost:</span>
            <span className="text-blue-600 dark:text-blue-400">
              {calculateTotal()} AED
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            *Final price may vary based on actual duration
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
