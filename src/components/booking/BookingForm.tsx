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
import {
  ApiResponseAvailablity,
  BookingResponse,
  OrderResponse,
} from '../../types/api'
import { API_ENDPOINTS, ERROR_MESSAGES } from '@/lib/constants'
import { zodResolver } from '@hookform/resolvers/zod'
import { LeadSchema, bookingLeadSchema } from '@/lib/schemas'
import InputPhoneNew from '../ui/InputPhoneNew'
import { ApiError, apiRequest } from '@/lib/api'
import { notificationVariants } from '@/lib/motion-variants'
import { motion } from 'framer-motion'
import PaymentModal from './PaymentModal'
import useFlag from '@/hooks/useFlag'
import { useBooking } from '@/hooks/storeHooks/useBooking'
import { SCROLL_TARGETS } from '@/hooks/useScrollNavigation'
import SelectTime from './SelectTime'
import { BookingSummary } from './BookingSummary'
import { Preloader } from '../ui/preloader'

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
  const {
    selectStudioId,
    selectServiceId,
    selectPackageId,
    selectServiceTypeSlug,
    isBooking,
    selectStudio,
  } = useBooking()

  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [availableTimes, setAvailableTimes] = useState<TimeSlotList[] | null>(
    null
  )
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  const [selectedTime, setSelectedTime] = useState('')
  const [duration, setDuration] = useState(1)
  const [guests, setGuests] = useState(1)
  const [isPaymentModalOpen, openPaymentModal, closePaymentModal] = useFlag()
  const [totalAmount, setTotalAmount] = useState(0)
  const [additionalServices, setAdditionalServices] = useState<
    Array<{ id: string; quantity: number }>
  >([])
  const [paymentUrl, setPaymentUrl] = useState('')

  const handleAdditionalServicesChange = (
    services: Array<{ id: string; quantity: number }>
  ) => {
    setAdditionalServices(services)
  }

  const [formKey, setFormKey] = useState(0)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    trigger,
    watch,
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

  const phoneValue = watch('phoneNumber')

  const handlePhoneChange = (value: string) => {
    setValue('phoneNumber', value)
    trigger('phoneNumber')
  }

  const onSubmit = handleSubmit(async (formData: LeadSchema) => {
    setSubmitError(null)
    setSubmitSuccess(false)
    if (!selectedTime && isBooking) {
      setSubmitError(ERROR_MESSAGES.BOOKING.SELECT_TIME)
      return
    }
    try {
      let response
      if (isBooking) {
        response = await apiRequest<BookingResponse>(API_ENDPOINTS.BOOKINGS, {
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
            additionalServices: additionalServices.map(s => ({
              id: s.id,
              quantity: s.quantity,
            })),
          }),
        })
      } else {
        response = await apiRequest<OrderResponse>(API_ENDPOINTS.ORDERS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            serviceId: selectServiceId,
            discountCode: formData.discountCode || null,
            lead: {
              fullName: formData.fullName,
              email: formData.email,
              phoneNumber: formData.phoneNumber,
            },
          }),
        })
      }

      if (response?.paymentUrl) {
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
      } else {
        setSubmitError(ERROR_MESSAGES.BOOKING.FAILED)
      }
    }
  })

  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(new Date())
      return
    }

    if (!isBooking) {
      return
    }

    const fetchTimes = async () => {
      const slots = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`

      try {
        setIsLoadingSlots(true)
        const data = await apiRequest<ApiResponseAvailablity>(
          `${API_ENDPOINTS.STUDIOS}/${selectStudioId}?date=${slots}&view=day&duration=${duration}`,
          {
            cache: 'no-store',
          }
        )

        if (data?.availability?.timeSlots) {
          setAvailableTimes(data.availability.timeSlots)
          if (
            selectedTime &&
            !data.availability.timeSlots.some(
              slot => slot.start === selectedTime
            )
          ) {
            setSelectedTime('')
          }
        } else {
          setAvailableTimes([])
        }
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message)
        } else {
          toast.error(ERROR_MESSAGES.STUDIO.FAILED_TO_FETCH_TIMES)
        }
        setIsLoadingSlots(false)
      } finally {
        setIsLoadingSlots(false)
      }
    }
    fetchTimes()
  }, [selectedDate, selectStudioId, duration, selectedTime, isBooking])

  useEffect(() => {
    setSelectedTime('')
    setDuration(1)
    setGuests(1)
    setAdditionalServices([])
    setSelectedDate(new Date())
    setAvailableTimes(null)
  }, [selectServiceTypeSlug])

  return (
    <section id={SCROLL_TARGETS.BOOKING.FORM} className="lg:py-16 py-10">
      <form onSubmit={onSubmit} className="lg:space-y-24 space-y-12">
        {isBooking && (
          <>
            <div className="lg:space-y-12 space-y-8">
              <h2>
                Choose <span className="text-accent">studio</span>
              </h2>
              <div className="grid lg:grid-cols-2 xl:gap-16 gap-6 py-6 justify-items-center max-w-7xl mx-auto">
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

            {selectStudioId && (
              <div className="lg:space-y-24 space-y-12">
                <div className="lg:space-y-12 space-y-8">
                  <h2>
                    Choose preferred <span className="text-accent">date</span> &{' '}
                    <span className="text-accent">time</span>
                  </h2>

                  <div className="flex justify-center flex-wrap lg:gap-10 gap-4">
                    <Card className="rounded-2xl border-none py-2 overflow-hidden lg:shadow-2xl/10 shadow-sm">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={date => setSelectedDate(date)}
                        disabled={{
                          before: new Date(new Date().setHours(0, 0, 0, 0)),
                        }}
                      />
                    </Card>
                    <Card className="rounded-2xl flex items-center justify-center border-none px-4 py-6 overflow-hidden lg:shadow-2xl/10 shadow-sm lg:min-w-[410px] sm:min-w-[395px] min-w-[320px] relative">
                      <Preloader
                        className="absolute inset-0 w-full h-full bg-background/80 backdrop-blur-sm"
                        variant="wave"
                        size="lg"
                        show={isLoadingSlots}
                      />
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
                    <div className="flex xl:flex-col md:flex-row flex-col justify-center items-center gap-8 min-w-[320px]">
                      <div className="space-y-6">
                        <Label
                          className="font-hanken-grotesk font-medium text-3xl"
                          htmlFor="duration"
                        >
                          Number of <span className="text-accent">guests</span>
                        </Label>
                        <DurationSelector
                          value={guests}
                          max={
                            initialStudios.find(
                              studio => studio.id === selectStudioId
                            )?.totalSeats || 8
                          }
                          onChange={setGuests}
                        />
                      </div>
                      <div className="space-y-6">
                        <Label
                          className="font-hanken-grotesk font-medium text-3xl"
                          htmlFor="duration"
                        >
                          Duration <span className="text-accent">hours</span>
                        </Label>
                        <DurationSelector
                          value={duration}
                          onChange={setDuration}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="lg:space-y-12 space-y-8">
                  <h2>
                    Chose preffered{' '}
                    <span className="text-accent">additional services</span>
                  </h2>
                  {initialAdditionalServices?.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 justify-items-center gap-y-8 xl:gap-x-16 lg:gap-x-8 gap-4 max-w-7xl mx-auto">
                      {initialAdditionalServices.map(service => {
                        if (!service || !service.id) return null
                        return (
                          <ServiceCheckbox
                            key={`service-${service.id}`}
                            service={service}
                            onChange={handleAdditionalServicesChange}
                            selectedServices={additionalServices || []}
                          />
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        <div className="lg:space-y-12 space-y-8">
          <h2>
            Leave your <span className="text-accent">contact data</span>
          </h2>
          <div className="md:space-y-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4 gap-8">
              <div className="space-y-3">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  size="md"
                  {...register('fullName')}
                  placeholder="John Doe"
                  error={errors.fullName?.message}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  size="md"
                  {...register('email')}
                  placeholder="john@example.com"
                  error={errors.email?.message}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 md:gap-4 gap-8">
              <div className="space-y-3 md:col-span-3">
                <Label htmlFor="phone">Phone</Label>
                <InputPhoneNew
                  key={formKey}
                  id="phone"
                  size="md"
                  value={phoneValue}
                  error={errors.phoneNumber?.message}
                  onChangeValue={handlePhoneChange}
                />
              </div>
              <div className="space-y-3 md:col-span-2">
                <Label htmlFor="discountCode">Discount code (optional)</Label>
                <Input
                  id="discountCode"
                  size="md"
                  {...register('discountCode')}
                  placeholder="Discount code"
                  error={errors.discountCode?.message}
                />
              </div>
            </div>

            {submitSuccess && (
              <motion.div
                variants={notificationVariants}
                initial="hidden"
                animate="visible"
                className="bg-green-100 border border-green-300 rounded-lg p-3"
              >
                <p className="text-green-600">
                  {isBooking
                    ? "Booking submitted successfully! We'll contact you soon to confirm your session."
                    : "Order submitted successfully! We'll contact you soon to confirm your order."}
                </p>
              </motion.div>
            )}
          </div>
        </div>

        <div className="lg:space-y-12 space-y-8 sticky top-20">
          <BookingSummary
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            duration={isBooking ? duration : null}
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
