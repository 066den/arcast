import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const packages = await prisma.package.findMany({
      include: {
        servicePackageRecords: {
          include: {
            includedService: true,
          },
        },
        addServicePackageRecords: {
          include: {
            includedAdditionalService: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(packages)
  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
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

    const body = await request.json()
    const {
      name,
      description,
      basePrice,
      currency = 'AED',
      isActive = true,
      services,
    } = body

    if (!name || !basePrice) {
      return NextResponse.json(
        { error: 'Name and base price are required' },
        { status: 400 }
      )
    }

    const newPackage = await prisma.package.create({
      data: {
        name,
        description,
        basePrice: parseFloat(basePrice),
        currency,
        isActive,
        servicePackageRecords: services
          ? {
              create: services.map(
                (s: { serviceId: string; quantity: number }) => ({
                  includedServiceId: s.serviceId,
                  serviceQuantity: s.quantity,
                })
              ),
            }
          : undefined,
      },
      include: {
        servicePackageRecords: {
          include: {
            includedService: true,
          },
        },
      },
    })

    return NextResponse.json(newPackage, { status: 201 })
  } catch (error) {
    console.error('Error creating package:', error)
    return NextResponse.json(
      { error: 'Failed to create package' },
      { status: 500 }
    )
  }
}
