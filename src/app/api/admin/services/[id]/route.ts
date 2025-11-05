import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const service = await prisma.service.findUnique({
      where: {
        id,
      },
      include: {
        serviceType: true,
      },
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Convert Decimal to number for JSON serialization
    return NextResponse.json({
      ...service,
      price: Number(service.price),
    })
  } catch (error) {
    
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

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
    const sortOrder = formData.get('sortOrder')
      ? parseInt(formData.get('sortOrder') as string)
      : 0

    if (!name || !serviceTypeId || !price) {
      return NextResponse.json(
        { error: 'Name, service type, and price are required' },
        { status: 400 }
      )
    }

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id },
    })

    if (!existingService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
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

    const service = await prisma.service.update({
      where: {
        id,
      },
      data: {
        name,
        description,
        includes: includesArray,
        serviceTypeId,
        price: parseFloat(price),
        currency: currency || 'AED',
        isPopular,
        isActive,
        sortOrder,
      },
      include: {
        serviceType: true,
      },
    })

    // Convert Decimal to number for JSON serialization
    return NextResponse.json({
      ...service,
      price: Number(service.price),
    })
  } catch (error) {
    
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.service.delete({
      where: {
        id,
      },
    })

    return NextResponse.json({ message: 'Service deleted successfully' })
  } catch (error) {
    
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    )
  }
}
