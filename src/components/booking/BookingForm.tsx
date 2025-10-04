'use client'
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Studio,
  AdditionalService,
  TimeSlotList,
  Package,
  ServiceType,
} from '../../types'
import { StudioCard } from '../common/StudioCard'
import { ServiceCheckbox } from './ServiceCheckbox'
import { useForm } from 'react-hook-form'
import { DurationSelector } from '../ui/DurationSelector'
import { toast } from 'sonner'
import { ApiResponseAvailablity, BookingResponse } from '../../types/api'
import { API_ENDPOINTS, ERROR_MESSAGES } from '@/lib/constants'
import { zodResolver } from '@hookform/resolvers/zod'
import { LeadSchema, bookingLeadSchema } from '@/lib/schemas'
import InputPhone from '../ui/InputPhone'
import { ApiError, apiRequest } from '@/lib/api'
import { notificationVariants } from '@/lib/motion-variants'
import { motion } from 'framer-motion'
import PaymentModal from './PaymentModal'
import useFlag from '@/hooks/useFlag'
import { useBooking } from '@/hooks/storeHooks/useBooking'
import { SCROLL_TARGETS } from '@/hooks/useScrollNavigation'
import SelectTime from './SelectTime'
import { BookingSummary } from './BookingSummary'

interface BookingFormProps {
  initialStudios: Studio[]
  initialAdditionalServices: AdditionalService[]
  initialPackages?: Package[]
  initialServiceTypes?: ServiceType[]
}

const BookingForm = ({
  initialStudios,
  initialAdditionalServices,
  initialPackages,
  initialServiceTypes,
}: BookingFormProps) => {
  const { selectStudioId, selectServiceId, selectPackageId, selectStudio } =
    useBooking()

  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [availableTimes, setAvailableTimes] = useState<TimeSlotList[] | null>(
    null
  )

  const [selectedTime, setSelectedTime] = useState('')
  const [duration, setDuration] = useState(1)
  const [guests, setGuests] = useState(1)
  const [isPaymentModalOpen, openPaymentModal, closePaymentModal] = useFlag()
  const [totalAmount, setTotalAmount] = useState(0)
  const [additionalServices, setAdditionalServices] = useState<
    AdditionalService[]
  >([])
  const [paymentUrl, setPaymentUrl] = useState('')

  const [formKey, setFormKey] = useState(0)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    trigger,
    formState: { isSubmitting, isValid, errors },
  } = useForm({
    resolver: zodResolver(bookingLeadSchema),
    mode: 'onTouched',
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      discountCode: '',
    },
  })

  const handlePhoneChange = (value: string) => {
    setValue('phoneNumber', value)
    trigger('phoneNumber')
  }

  const onSubmit = handleSubmit(async (formData: LeadSchema) => {
    setSubmitError(null)
    setSubmitSuccess(false)
    if (!selectedTime) {
      setSubmitError(ERROR_MESSAGES.BOOKING.SELECT_TIME)
      return
    }
    try {
      const response = await apiRequest<BookingResponse>(
        API_ENDPOINTS.BOOKINGS,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studioId: selectStudioId,
            packageId: selectPackageId || null,
            serviceId: selectServiceId || null,
            numberOfSeats: guests,
            selectedTime,
            duration,
            discountCode: formData.discountCode || null,
            lead: {
              fullName: formData.fullName,
              email: formData.email,
              phoneNumber: formData.phoneNumber,
              whatsappNumber: formData.phoneNumber,
              recordingLocation: '',
            },
            additionalServices,
          }),
        }
      )

      if (response.paymentUrl) {
        setPaymentUrl(response.paymentUrl)
        setTotalAmount(response.finalAmount || response.totalCost)
        openPaymentModal()
      }
      // Reset form
      reset()
      setFormKey(prev => prev + 1)
      setSelectedTime('')
      setDuration(1)
      setGuests(1)
      setAdditionalServices([])
      setSubmitSuccess(true)
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(error.message)
        console.error('Error submitting booking:', error)
      } else {
        setSubmitError(ERROR_MESSAGES.BOOKING.FAILED)
      }
    }
  })

  useEffect(() => {
    if (!selectedDate || !selectStudioId) return

    const fetchTimes = async () => {
      const slots = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`

      try {
        const data = await apiRequest<ApiResponseAvailablity>(
          `${API_ENDPOINTS.STUDIOS}/${selectStudioId}?date=${slots}&view=day&duration=${duration}`,
          {
            cache: 'no-store',
          }
        )

        setAvailableTimes(data.availability.timeSlots)
        if (
          selectedTime &&
          !data.availability.timeSlots.some(slot => slot.start === selectedTime)
        ) {
          setSelectedTime('')
        }
      } catch (error) {
        console.error('Error fetching times:', error)
        if (error instanceof ApiError) {
          toast.error(error.message)
        } else {
          toast.error(ERROR_MESSAGES.STUDIO.FAILED_TO_FETCH_TIMES)
        }
      }
    }
    fetchTimes()
  }, [selectedDate, selectStudioId, duration, selectedTime])

  return (
    <section id={SCROLL_TARGETS.BOOKING.FORM} className="lg:py-16 py-10">
      <form onSubmit={onSubmit} className="space-y-24">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <div className="space-y-12">
              <h2>
                Choose preferred <span className="text-accent">date</span> &{' '}
                <span className="text-accent">time</span>
              </h2>

              <div className="flex justify-center gap-10">
                <Card className="rounded-2xl border-none py-2 overflow-hidden shadow-2xl/10">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={date => setSelectedDate(date)}
                    disabled={{
                      before: new Date(new Date().setHours(0, 0, 0, 0)),
                    }}
                  />
                </Card>
                <Card className="rounded-2xl flex items-center justify-center border-none px-4 py-6 overflow-hidden shadow-2xl/10 min-w-[410px]">
                  {availableTimes ? (
                    <SelectTime
                      times={availableTimes}
                      selectedTime={selectedTime}
                      onSelectTime={setSelectedTime}
                      duration={duration}
                    />
                  ) : (
                    <p>No available times</p>
                  )}
                </Card>
                <div className="flex flex-col justify-center items-center gap-8 min-w-[320px]">
                  <div className="space-y-6">
                    <Label
                      className="font-hanken-grotesk font-medium text-3xl"
                      htmlFor="duration"
                    >
                      Number of <span className="text-accent">guests</span>
                    </Label>
                    <DurationSelector value={guests} onChange={setGuests} />
                  </div>
                  <div className="space-y-6">
                    <Label
                      className="font-hanken-grotesk font-medium text-3xl"
                      htmlFor="duration"
                    >
                      Duration <span className="text-accent">hours</span>
                    </Label>
                    <DurationSelector value={duration} onChange={setDuration} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-12">
              <h2>
                Choose <span className="text-accent">studio</span>
              </h2>

              <div className="grid sm:grid-cols-2 lg:gap-16 gap-6 py-6 justify-items-center max-w-7xl mx-auto">
                {initialStudios.map(studio => (
                  <StudioCard
                    key={studio.id}
                    studio={studio}
                    isSelection
                    isSelected={selectStudioId === studio.id}
                    onClick={selectStudio}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-12">
              <h2>
                Chose preffered{' '}
                <span className="text-accent">additional services</span>
              </h2>
              {initialAdditionalServices?.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 justify-items-center gap-y-8 gap-x-16 max-w-7xl mx-auto">
                  {initialAdditionalServices.map(service => (
                    <ServiceCheckbox
                      key={service.id}
                      service={service}
                      onChange={setAdditionalServices}
                      selectedServices={additionalServices}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-12">
              <h2>
                Leave your <span className="text-accent">contact data</span>
              </h2>

              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="fullName">Full name</Label>
                    <Input
                      id="fullName"
                      {...register('fullName')}
                      placeholder="John Doe"
                      error={errors.fullName?.message}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="john@example.com"
                      error={errors.email?.message}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="phone">Phone</Label>
                    <InputPhone
                      key={formKey}
                      id="phone"
                      {...register('phoneNumber')}
                      error={errors.phoneNumber?.message}
                      onChangeValue={handlePhoneChange}
                    />
                  </div>
                  <div className="space-y-2 col-span-1">
                    <Label htmlFor="discountCode">
                      Discount code (optional)
                    </Label>
                    <Input
                      id="discountCode"
                      {...register('discountCode')}
                      placeholder="Discount code"
                      error={errors.discountCode?.message}
                    />
                  </div>
                </div>

                {submitError && (
                  <motion.div
                    variants={notificationVariants}
                    initial="hidden"
                    animate="visible"
                    className="bg-red-100 border rounded-lg p-3"
                  >
                    <p className="text-red-600">{submitError}</p>
                  </motion.div>
                )}

                {submitSuccess && (
                  <motion.div
                    variants={notificationVariants}
                    initial="hidden"
                    animate="visible"
                    className="bg-green-100 border border-green-300 rounded-lg p-3"
                  >
                    <p className="text-green-600">
                      Booking submitted successfully! We&apos;ll contact you
                      soon to confirm your session.
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
          <div className="col-span-1 pt-18">
            <div className="space-y-12 sticky top-20">
              <BookingSummary
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                duration={duration}
                guests={guests}
                selectedStudio={selectStudioId}
                selectedService={selectServiceId}
                selectedPackage={selectPackageId}
                selectedAdditionalServices={additionalServices}
                studios={initialStudios}
                packages={initialPackages}
                initialServiceTypes={initialServiceTypes || []}
                additionalServices={initialAdditionalServices}
              />
              <div className="flex justify-center">
                <Button
                  type="submit"
                  className="text-4xl font-hanken-grotesk font-medium w-full max-w-lg rounded-2xl h-18"
                  size="custom"
                  variant="accent"
                  disabled={isSubmitting || !isValid}
                >
                  {isSubmitting ? 'Submitting...' : 'Order Now'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Button type="button" onClick={openPaymentModal}>
          Pay Now
        </Button>

        <PaymentModal
          isOpen={isPaymentModalOpen}
          paymentUrl={paymentUrl}
          onClose={closePaymentModal}
          totalAmount={totalAmount}
        />
      </form>
    </section>
  )
}

export default BookingForm
