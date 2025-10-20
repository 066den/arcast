import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { BOOKING_STATUS } from '@/lib/constants'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        studio: true,
        lead: true,
        contentPackage: true,
        service: true,
        discountCode: true,
        bookingAdditionalServices: {
          include: {
            service: true,
          },
        },
        payment: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { status } = body

    // Validate status
    if (!Object.values(BOOKING_STATUS).includes(status)) {
      return NextResponse.json(
        { error: 'Invalid booking status' },
        { status: 400 }
      )
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status,
      },
      include: {
        studio: true,
        lead: true,
        contentPackage: true,
        service: true,
        discountCode: true,
        bookingAdditionalServices: {
          include: {
            service: true,
          },
        },
        payment: true,
      },
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
