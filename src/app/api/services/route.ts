import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const services = await prisma.additionalService.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        order: 'asc',
      },
    })

    // Transform the data to match the frontend expectations
    const transformedServices = services.map(service => ({
      id: service.id,
      title: service.title,
      description: service.description,
      price: service.price.toString(),
      currency: service.currency,
      duration: 'per hour', // You can add logic to determine duration based on type
      type: service.type,
      count: service.count,
      imageUrls: service.imageUrls,
      videoUrl: service.videoUrl,
    }))

    return NextResponse.json({ 
      success: true, 
      services: transformedServices 
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
    const { 
      title, 
      type, 
      price, 
      currency, 
      count, 
      description, 
      imageUrls, 
      videoUrl, 
      order 
    } = await req.json()

    const newService = await prisma.additionalService.create({
      data: {
        title,
        type,
        price: parseFloat(price),
        currency: currency || 'AED',
        count: count || 1,
        description,
        imageUrls: imageUrls || [],
        videoUrl,
        order: order || 999,
      },
    })

    return NextResponse.json({ 
      success: true, 
      service: newService 
    })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create service' },
      { status: 500 }
    )
  }
}
