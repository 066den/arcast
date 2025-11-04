import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      include: {
        serviceType: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    // Convert Decimal to number for JSON serialization
    return NextResponse.json(
      services.map(service => ({
        ...service,
        price: Number(service.price),
      }))
    )
  } catch (error) {
    
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const includes = formData.get('includes') as string
    const serviceTypeId = formData.get('serviceTypeId') as string
    const price = formData.get('price') as string
    const currency = formData.get('currency') as string
    const isPopular = formData.get('isPopular') === 'true'
    const isActive = formData.get('isActive') === 'true'

    if (!name || !serviceTypeId || !price) {
      return NextResponse.json(
        { error: 'Name, service type, and price are required' },
        { status: 400 }
      )
    }

    // Parse includes array from JSON string
    let includesArray: string[] = []
    if (includes) {
      try {
        includesArray = JSON.parse(includes)
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid includes format' },
          { status: 400 }
        )
      }
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        includes: includesArray,
        serviceTypeId,
        price: parseFloat(price),
        currency: currency || 'AED',
        isPopular,
        isActive,
      },
      include: {
        serviceType: true,
      },
    })

    // Convert Decimal to number for JSON serialization
    return NextResponse.json(
      {
        ...service,
        price: Number(service.price),
      },
      { status: 201 }
    )
  } catch (error) {
    
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    )
  }
}
