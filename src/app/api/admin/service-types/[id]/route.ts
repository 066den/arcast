import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ERROR_MESSAGES } from '@/lib/constants'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params

    const serviceType = await prisma.serviceType.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            services: true,
            samples: true,
          },
        },
      },
    })

    if (!serviceType) {
      return NextResponse.json(
        { error: 'Service type not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(serviceType)
  } catch (error) {
    
    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await req.json()
    const { name, description, slug, sortOrder, isActive } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists for a different service type
    const existingType = await prisma.serviceType.findUnique({
      where: { slug },
    })

    if (existingType && existingType.id !== id) {
      return NextResponse.json(
        { error: 'A service type with this slug already exists' },
        { status: 400 }
      )
    }

    const serviceType = await prisma.serviceType.update({
      where: { id },
      data: {
        name,
        description: description || null,
        slug,
        sortOrder: sortOrder ?? undefined,
        isActive,
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

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params

    // Check if service type has associated services
    const serviceType = await prisma.serviceType.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            services: true,
          },
        },
      },
    })

    if (!serviceType) {
      return NextResponse.json(
        { error: 'Service type not found' },
        { status: 404 }
      )
    }

    if (serviceType._count.services > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete service type with associated services. Please remove all services first.',
        },
        { status: 400 }
      )
    }

    await prisma.serviceType.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    
    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}
