import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSimpleTimeSlots } from '../../../../utils/time'
import { Studio, TimeSlotList } from '../../../../types'
import { BOOKING_STATUS, ERROR_MESSAGES, HTTP_STATUS } from '@/lib/constants'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const { searchParams } = new URL(request.url)
  const { date, view = 'day' } = Object.fromEntries(searchParams)

  try {
    // Parse date string and create date at midnight in UTC
    const dateParts = date.split('-')
    const targetDate = new Date(
      Date.UTC(
        parseInt(dateParts[0]), // year
        parseInt(dateParts[1]) - 1, // month (0-based)
        parseInt(dateParts[2]) // day
      )
    )

    if (isNaN(targetDate.getTime())) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_DATE_FORMAT },
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    const studio = await getStudioWithBookings(id, targetDate, view)

    if (!studio) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.STUDIO.NOT_FOUND },
        { status: HTTP_STATUS.NOT_FOUND }
      )
    }

    if (view === 'day') {
      const availability = await generateDayAvailability(studio, targetDate)
      return NextResponse.json({ success: true, studio, availability })
    }

    if (view === 'month') {
      const availability = await generateMonthAvailability(studio, targetDate)
      return NextResponse.json({ success: true, studio, availability })
    }

    if (!view) {
      return NextResponse.json({ status: 'success', studio })
    }

    return NextResponse.json(
      { error: ERROR_MESSAGES.INVALID_VIEW_PARAMETER },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}

// Helper method to get studio with filtered bookings
const getStudioWithBookings = async (
  studioId: string,
  targetDate: Date,
  view: string
) => {
  const dateFilter =
    view === 'month'
      ? {
          startTime: {
            gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), 1),
          },
          endTime: {
            lt: new Date(
              targetDate.getFullYear(),
              targetDate.getMonth() + 1,
              1
            ),
          },
        }
      : {
          startTime: {
            gte: new Date(
              Date.UTC(
                targetDate.getFullYear(),
                targetDate.getMonth(),
                targetDate.getDate(),
                0,
                0,
                0
              )
            ),
          },
          endTime: {
            lt: new Date(
              Date.UTC(
                targetDate.getFullYear(),
                targetDate.getMonth(),
                targetDate.getDate() + 1,
                0,
                0,
                0
              )
            ),
          },
        }

  return await prisma.studio.findUnique({
    where: { id: studioId },
    include: {
      bookings: {
        where: {
          AND: [{ status: { not: BOOKING_STATUS.CANCELLED } }, dateFilter],
        },
      },
    },
  })
}

// Helper method to generate day availability
const generateDayAvailability = async (studio: Studio, targetDate: Date) => {
  // Get current time in Dubai timezone
  const now = new Date()
  const dubaiNow = new Date(
    now.toLocaleString('en-US', { timeZone: 'Asia/Dubai' })
  )
  const today = new Date(
    dubaiNow.getFullYear(),
    dubaiNow.getMonth(),
    dubaiNow.getDate()
  )

  // Create target date at midnight in UTC
  const targetDateMidnight = new Date(
    Date.UTC(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
      0,
      0,
      0
    )
  )

  // Check if date is in the past
  if (targetDateMidnight < today) {
    return {
      studioId: studio.id,
      date: targetDate.toISOString().split('T')[0],
      timeSlots: [],
      message: ERROR_MESSAGES.BOOKING.PAST_DATE,
    }
  }

  // Get bookings for the specific date
  const dayBookings = studio.bookings
    ? filterBookingsForDate(
        studio.bookings.map(b => ({
          startTime: new Date(b.startTime),
          endTime: new Date(b.endTime),
        })),
        targetDateMidnight
      )
    : []

  // Generate time slots using simple function
  const timeSlots = generateSimpleTimeSlots(
    studio.openingTime,
    studio.closingTime,
    dayBookings,
    targetDate
  )

  // Filter to show only available slots
  const isToday = isSameDate(targetDate, today)

  const availableTimeSlots = isToday
    ? timeSlots.filter(
        slot => slot.available && new Date(slot.start) > dubaiNow
      )
    : timeSlots.filter(slot => slot.available)

  return {
    studioId: studio.id,
    date: targetDate.toISOString().split('T')[0],
    timeSlots: availableTimeSlots,
  }
}

// Helper method to generate month availability
const generateMonthAvailability = async (
  studio: {
    id: string
    openingTime: string
    closingTime: string
    bookings?: { startTime: Date; endTime: Date }[]
  },
  targetDate: Date
) => {
  const firstDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1)
  const daysInMonth = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth() + 1,
    0
  ).getDate()

  // Get current date
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const monthAvailability = []

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(
      firstDay.getFullYear(),
      firstDay.getMonth(),
      day
    )
    currentDate.setHours(0, 0, 0, 0)

    const isToday = isSameDate(currentDate, today)
    const isPast = currentDate < today && !isToday

    if (isPast) {
      monthAvailability.push(createPastDayEntry(currentDate))
      continue
    }

    // Get bookings for this day
    const dayBookings = studio.bookings
      ? filterBookingsForDate(
          studio.bookings.map(b => ({
            startTime: new Date(b.startTime),
            endTime: new Date(b.endTime),
          })),
          currentDate
        )
      : []

    // Generate time slots using simple function
    const timeSlots = generateSimpleTimeSlots(
      studio.openingTime,
      studio.closingTime,
      dayBookings,
      currentDate
    )

    // Calculate availability
    const { availableSlots, totalSlots } = calculateSlotAvailability(
      timeSlots,
      isToday
    )

    monthAvailability.push({
      date: currentDate.toISOString().split('T')[0],
      status: getDayStatus(availableSlots, totalSlots),
      availableSlots,
      totalSlots,
      metadata: {
        isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
        bookings: dayBookings.length,
      },
    })
  }

  return {
    studioId: studio.id,
    month: firstDay.toISOString().split('T')[0],
    availability: monthAvailability,
  }
}

const isSameDate = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

const filterBookingsForDate = (
  bookings: { startTime: Date; endTime: Date }[],
  targetDate: Date
) => {
  return bookings.filter(booking => {
    const bookingDate = new Date(booking.startTime)
    return isSameDate(bookingDate, targetDate)
  })
}

const createPastDayEntry = (date: Date) => ({
  date: date.toISOString().split('T')[0],
  status: 'past',
  availableSlots: 0,
  totalSlots: 0,
  metadata: {
    isWeekend: date.getDay() === 0 || date.getDay() === 6,
  },
})

const calculateSlotAvailability = (
  timeSlots: TimeSlotList[],
  isToday: boolean
) => {
  if (!isToday) {
    return {
      availableSlots: timeSlots.filter(slot => slot.available).length,
      totalSlots: timeSlots.length,
    }
  }

  const now = new Date()
  const dubaiNow = new Date(
    now.toLocaleString('en-US', { timeZone: 'Asia/Dubai' })
  )
  const futureSlots = timeSlots.filter(slot => new Date(slot.start) > dubaiNow)

  return {
    availableSlots: futureSlots.filter(slot => slot.available).length,
    totalSlots: futureSlots.length,
  }
}

const getDayStatus = (availableSlots: number, totalSlots: number) => {
  if (totalSlots === 0) return 'past'
  if (availableSlots === 0) return 'fully-booked'
  if (availableSlots < totalSlots) return 'partially-booked'
  return 'available'
}
