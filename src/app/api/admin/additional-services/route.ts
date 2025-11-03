import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  try {
    const services = await prisma.additionalService.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(services)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch additional services' },
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

    const service = await prisma.additionalService.create({
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

    return NextResponse.json(service, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Failed to create additional service' },
      { status: 500 }
    )
  }
}
