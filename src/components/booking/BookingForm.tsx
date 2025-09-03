'use client'
import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MapPin, CreditCard } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { BookingSummary } from './BookingSummary'
import {
  Studio,
  AdditionalService,
  StudioPackage,
  TimeSlotList,
} from '../../types'
import { StudioCard } from '../common/StudioCard'
import { ServiceCheckbox } from './ServiceCheckbox'
import { useStudios } from '../../hooks/storeHooks/useStudios'
import { PackageCard } from './PackageCard'
import { useForm } from 'react-hook-form'
import { Popover, PopoverContent } from '../ui/popover'
import { PopoverTrigger } from '../ui/popover'
import SelectTime from './SelectTime'
import { DurationSelector } from '../ui/DurationSelector'
import { toast } from 'sonner'
import { ApiResponseAvailablity } from '../../types/api'
import { API_ENDPOINTS, ERROR_MESSAGES } from '@/lib/constants'
import { zodResolver } from '@hookform/resolvers/zod'
import { LeadSchema, bookingLeadSchema } from '@/lib/schemas'

interface BookingFormProps {
  initialStudios: Studio[]
  initialPackages: StudioPackage[]
  initialServices: AdditionalService[]
}

const BookingForm = ({
  initialStudios,
  initialPackages,
  initialServices,
}: BookingFormProps) => {
  const {
    selectedStudioId,
    selectedPackageId,
    onSelectStudio,
    onSelectPackage,
    setStudios,
    setPackages,
  } = useStudios()

  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [availableTimes, setAvailableTimes] = useState<TimeSlotList[] | null>(
    null
  )

  const [selectedTime, setSelectedTime] = useState('')
  const [duration, setDuration] = useState(1)
  const [guests, setGuests] = useState(1)

  const [selectedServices, setSelectedServices] = useState<AdditionalService[]>(
    []
  )

  const selectedStudio = initialStudios.find(
    studio => studio.id === selectedStudioId
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(bookingLeadSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      discountCode: '',
    },
  })

  const onSubmit = handleSubmit(async (formData: LeadSchema) => {
    setSubmitError(null)
    setSubmitSuccess(false)
    try {
      const response = await fetch(API_ENDPOINTS.BOOKINGS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studioId: selectedStudioId,
          packageId: selectedPackageId,
          numberOfSeats: guests,
          selectedTime,
          duration,
          discountCode: formData.discountCode,
          lead: {
            fullName: formData.fullName,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            whatsappNumber: formData.phoneNumber,
            recordingLocation: '',
          },
          additionalServices: selectedServices,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Reset form
        reset()
        setSelectedTime('')
        setDuration(1)
        setGuests(1)
        setSelectedServices([])
      } else {
        setSubmitError(data.error || 'Failed to create booking')
      }
    } catch (error) {
      setSubmitError('Network error. Please try again.')
      console.error('Error submitting booking:', error)
    }
  })

  useEffect(() => {
    setStudios(initialStudios)
    setPackages(initialPackages)
  }, [initialStudios, initialPackages, setStudios, setPackages])

  useEffect(() => {
    if (!selectedDate || !selectedStudioId) return

    const fetchTimes = async () => {
      try {
        const response = await fetch(
          `${API_ENDPOINTS.STUDIOS}/${selectedStudioId}?date=${selectedDate.toLocaleDateString('en-US')}&view=day`
        )
        if (!response.ok) {
          toast.error(ERROR_MESSAGES.STUDIO.FAILED_TO_FETCH_TIMES)
          return
        }
        const data: ApiResponseAvailablity = await response.json()
        setAvailableTimes(data.availability.timeSlots)
      } catch (error) {
        console.error('Error fetching times:', error)
      }
    }
    fetchTimes()
  }, [selectedDate, selectedStudioId])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <form onSubmit={onSubmit} className="space-y-4">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Select Date & Time
              </CardTitle>
              <CardDescription>
                Choose when you&apos;d like to book your studio session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">Select Date</Button>
                    </PopoverTrigger>
                    <PopoverContent align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={date => setSelectedDate(date)}
                        disabled={{ before: new Date() }}
                      />
                      <Button variant="outline" size="sm">
                        Done
                      </Button>
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Start Time</Label>

                  {availableTimes ? (
                    <SelectTime
                      times={availableTimes}
                      selectedTime={selectedTime}
                      onSelectTime={setSelectedTime}
                      duration={duration}
                      studio={selectedStudio}
                    />
                  ) : (
                    <p>No available times</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (hours)</Label>
                  <DurationSelector value={duration} onChange={setDuration} />
                </div>
                <div>
                  <Label htmlFor="guests">Number of Guests</Label>
                  <Input
                    id="guests"
                    type="number"
                    min="1"
                    max="10"
                    value={guests}
                    onChange={e => setGuests(parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Choose Studio
              </CardTitle>
              <CardDescription>
                Select the studio that best fits your needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                {initialStudios.map(studio => (
                  <StudioCard
                    key={studio.id}
                    studio={studio}
                    isSelected={selectedStudioId === studio.id}
                    onClick={onSelectStudio}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Select Package
              </CardTitle>
              <CardDescription>
                Choose the service package that suits your requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {initialPackages?.map(pkg => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    isSelected={selectedPackageId === pkg.id}
                    onClick={() => onSelectPackage(pkg.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Additional Services</CardTitle>
              <CardDescription>
                Enhance your recording session with these optional services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {initialServices.map(service => (
                  <ServiceCheckbox
                    key={service.id}
                    service={service}
                    onChange={setSelectedServices}
                    selectedServices={selectedServices}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Please provide your details so we can confirm your booking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" {...register('fullName')} />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register('email')} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" {...register('phoneNumber')} />
                </div>
                <div>
                  <Label htmlFor="discountCode">Discount Code</Label>
                  <Input
                    id="discountCode"
                    {...register('discountCode')}
                    placeholder="Discount code (optional)"
                  />
                </div>
                {submitError && (
                  <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-3">
                    <p className="text-red-600 dark:text-red-300 text-sm">
                      {submitError}
                    </p>
                  </div>
                )}

                {submitSuccess && (
                  <div className="bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg p-3">
                    <p className="text-green-600 dark:text-green-300 text-sm">
                      Booking submitted successfully! We&apos;ll contact you
                      soon to confirm your session.
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting || !isValid}
                >
                  {isSubmitting ? 'Submitting...' : 'Book Studio Session'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
      {/* Боковая панель с итогами */}
      <div className="lg:col-span-1">
        <BookingSummary
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          duration={duration}
          guests={guests}
          selectedStudio={selectedStudioId}
          selectedPackage={selectedPackageId}
          selectedServices={selectedServices}
          studios={initialStudios}
          packages={initialPackages}
          additionalServices={initialServices}
        />
      </div>
    </div>
  )
}

export default BookingForm
