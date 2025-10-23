import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const services = await prisma.additionalService.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformedServices = services.map((service: any) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      currency: service.currency,
      duration: 'per hour', // You can add logic to determine duration based on type
      type: service.type,
      count: service.count,
      imageUrls: service.imageUrls,
    }))

    return NextResponse.json({
      success: true,
      services: transformedServices,
    })
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const { name, type, price, currency, count, description, imageUrls } =
      await req.json()

    const newService = await prisma.additionalService.create({
      data: {
        name,
        type,
        price: parseFloat(price),
        currency: currency || 'AED',
        count: count || 1,
        description,
        imageUrls: imageUrls || [],
      },
    })

    return NextResponse.json({
      success: true,
      service: newService,
    })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create service' },
      { status: 500 }
    )
  }
}
