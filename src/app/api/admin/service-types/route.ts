import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ERROR_MESSAGES } from '@/lib/constants'

export async function GET() {
  try {
    const serviceTypes = await prisma.serviceType.findMany({
      orderBy: {
        sortOrder: 'asc',
      },
      include: {
        _count: {
          select: {
            services: true,
            samples: true,
          },
        },
      },
    })

    return NextResponse.json(serviceTypes)
  } catch (error) {
    
    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, description, slug, sortOrder, isActive } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingType = await prisma.serviceType.findUnique({
      where: { slug },
    })

    if (existingType) {
      return NextResponse.json(
        { error: 'A service type with this slug already exists' },
        { status: 400 }
      )
    }

    const serviceType = await prisma.serviceType.create({
      data: {
        name,
        description: description || null,
        slug,
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json(serviceType)
  } catch (error) {
    
    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}
