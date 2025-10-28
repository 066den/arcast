import { ERROR_MESSAGES } from '@/lib/constants'
import { TimeSlotList } from '@/types'

export type BookingTimeRange = {
  startTime: Date | string
  endTime: Date | string
}

// Helper function to get current time in Dubai timezone
export const getDubaiTime = (): Date => {
  const now = new Date()
  // Get Dubai time using toLocaleString
  const dubaiTimeString = now.toLocaleString('en-US', {
    timeZone: 'Asia/Dubai',
  })
  return new Date(dubaiTimeString)
}

// Helper function to get current date in Dubai timezone
export const getDubaiDate = (): Date => {
  const dubaiTime = getDubaiTime()
  // Create date at midnight in Dubai timezone
  return new Date(
    dubaiTime.getFullYear(),
    dubaiTime.getMonth(),
    dubaiTime.getDate()
  )
}

// Helper function to create a date in Dubai timezone
export const createDubaiDate = (
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): Date => {
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour - 4, minute, 0))
  return utcDate
}

export const generateAvailableTimeSlots = (
  openingTime: string,
  closingTime: string,
  bookings: BookingTimeRange[],
  targetDate: Date
) => {
  try {
    // Validate input parameters
    if (!openingTime || !closingTime || !targetDate) {
      throw new Error(ERROR_MESSAGES.INVALID_REQUEST)
    }

    // Parse opening and closing times
    const [openHour, openMinute] = openingTime.split(':').map(Number)
    const [closeHour, closeMinute] = closingTime.split(':').map(Number)

    if (
      isNaN(openHour) ||
      isNaN(openMinute) ||
      isNaN(closeHour) ||
      isNaN(closeMinute)
    ) {
      throw new Error(ERROR_MESSAGES.INVALID_TIME_FORMAT)
    }

    if (openHour < 0 || openHour > 23 || closeHour < 0 || closeHour > 23) {
      throw new Error(ERROR_MESSAGES.HOURS_MUST_BE_BETWEEN_0_AND_23)
    }

    if (
      openMinute < 0 ||
      openMinute > 59 ||
      closeMinute < 0 ||
      closeMinute > 59
    ) {
      throw new Error(ERROR_MESSAGES.MINUTES_MUST_BE_BETWEEN_0_AND_59)
    }

    // Convert targetDate to Date object if it's a string
    const targetDateObj = targetDate
    if (isNaN(targetDateObj.getTime())) {
      throw new Error(ERROR_MESSAGES.INVALID_DATE_FORMAT)
    }

    // Get current time in local timezone (same as targetDate)
    const currentTime = new Date()

    // Check if targetDate is today by comparing date strings in local timezone
    const targetDateString = targetDateObj.toDateString()
    const currentDateString = currentTime.toDateString()
    const isToday = targetDateString === currentDateString

    // Create start time for the target date
    let effectiveStartHour = openHour
    let effectiveStartMinute = openMinute

    if (isToday) {
      const currentHour = currentTime.getHours()
      const currentMinute = currentTime.getMinutes()

      // Round up to the next hour if we have minutes
      effectiveStartHour = currentMinute > 0 ? currentHour + 1 : currentHour
      effectiveStartMinute = 0

      // For today, use the later of the opening time or current time
      effectiveStartHour = Math.max(effectiveStartHour, openHour)
      if (effectiveStartHour === openHour) {
        effectiveStartMinute = Math.max(effectiveStartMinute, openMinute)
      }

      // If we've passed closing time for today, return empty slots
      if (
        effectiveStartHour > closeHour ||
        (effectiveStartHour === closeHour &&
          effectiveStartMinute >= closeMinute)
      ) {
        return []
      }
    }

    // Create start and end times for the target date in local timezone
    const dayStart = new Date(
      targetDateObj.getFullYear(),
      targetDateObj.getMonth(),
      targetDateObj.getDate(),
      effectiveStartHour,
      effectiveStartMinute
    )

    const dayEnd = new Date(
      targetDateObj.getFullYear(),
      targetDateObj.getMonth(),
      targetDateObj.getDate(),
      closeHour,
      closeMinute
    )

    // Validate that dayStart is before dayEnd
    if (dayStart >= dayEnd) {
      return []
    }

    const slots = []
    let currentSlot = new Date(dayStart)

    // Generate hourly slots for the day
    while (currentSlot < dayEnd) {
      const slotEnd = new Date(currentSlot.getTime() + 60 * 60 * 1000) // Add 1 hour

      // Check if slot overlaps with any booking
      const isAvailable = !bookings.some(booking => {
        const bookingStart = new Date(booking.startTime)
        const bookingEnd = new Date(booking.endTime)

        // Validate booking times
        if (isNaN(bookingStart.getTime()) || isNaN(bookingEnd.getTime())) {
          return false // Skip invalid bookings
        }

        // Convert all times to timestamps for comparison
        const slotStartTime = currentSlot.getTime()
        const slotEndTime = slotEnd.getTime()
        const bookingStartTime = bookingStart.getTime()
        const bookingEndTime = bookingEnd.getTime()

        // Check for overlap: if any part of the slot overlaps with the booking
        return (
          (slotStartTime >= bookingStartTime &&
            slotStartTime < bookingEndTime) ||
          (slotEndTime > bookingStartTime && slotEndTime <= bookingEndTime) ||
          (slotStartTime <= bookingStartTime && slotEndTime >= bookingEndTime)
        )
      })

      slots.push({
        start: currentSlot.toISOString(),
        end: slotEnd.toISOString(),
        available: isAvailable,
      })

      currentSlot = slotEnd
    }

    return slots.filter(slot => slot.available)
  } catch {
    return []
  }
}

export function isSlotWithinWorkingHours(
  startTime: string,
  endTime: string,
  openingTime: string,
  closingTime: string
): boolean {
  return startTime >= openingTime && endTime <= closingTime
}

export function generateSimpleTimeSlots(
  openingTime: string,
  closingTime: string
): Array<{ start: string; end: string }> {
  const slots: Array<{ start: string; end: string }> = []
  return slots
}

export function formatTimeRange(
  startTime: string,
  duration: number,
  timezone: string
): string {
  const start = new Date(startTime)
  const end = new Date(start.getTime() + duration * 60 * 60 * 1000)
  return `${start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
}
