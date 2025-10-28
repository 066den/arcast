import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const service = await prisma.additionalService.findUnique({
      where: { id },
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    return NextResponse.json(service)
  } catch {
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
    const type = formData.get('type') as string
    const price = formData.get('price') as string
    const currency = formData.get('currency') as string
    const count = formData.get('count') as string
    const description = formData.get('description') as string
    const isActive = formData.get('isActive') === 'true'
    const imageUrls = formData.get('imageUrls') as string

    if (!name || !type || !price) {
      return NextResponse.json(
        { error: 'Name, type, and price are required' },
        { status: 400 }
      )
    }

    // Check if service exists
    const existingService = await prisma.additionalService.findUnique({
      where: { id },
    })

    if (!existingService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Parse imageUrls array from JSON string
    let imageUrlsArray: string[] = []
    if (imageUrls) {
      try {
        imageUrlsArray = JSON.parse(imageUrls)
      } catch {
        return NextResponse.json(
          { error: 'Invalid imageUrls format' },
          { status: 400 }
        )
      }
    }

    const service = await prisma.additionalService.update({
      where: {
        id,
      },
      data: {
        name,
        type: type as 'STANDARD' | 'BY_THREE',
        price: parseFloat(price),
        currency: currency || 'AED',
        count: parseInt(count) || 1,
        description: description || null,
        imageUrls: imageUrlsArray,
        isActive,
      },
    })

    return NextResponse.json(service)
  } catch {
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

    // Check if service exists
    const existingService = await prisma.additionalService.findUnique({
      where: { id },
    })

    if (!existingService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    await prisma.additionalService.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    )
  }
}
