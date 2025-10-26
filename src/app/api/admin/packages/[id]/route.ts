import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const packageData = await prisma.package.findUnique({
      where: {
        id,
      },
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
    })

    if (!packageData) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    return NextResponse.json(packageData)
  } catch (error) {
    console.error('Error fetching package:', error)
    return NextResponse.json(
      { error: 'Failed to fetch package' },
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

    // Check if package exists
    const existingPackage = await prisma.package.findUnique({
      where: { id },
    })

    if (!existingPackage) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    // Delete existing service records
    await prisma.servicePackageRecord.deleteMany({
      where: { parentContentPackageId: id },
    })

    const updatedPackage = await prisma.package.update({
      where: {
        id,
      },
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

    return NextResponse.json(updatedPackage)
  } catch (error) {
    console.error('Error updating package:', error)
    return NextResponse.json(
      { error: 'Failed to update package' },
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

    await prisma.package.delete({
      where: {
        id,
      },
    })

    return NextResponse.json({ message: 'Package deleted successfully' })
  } catch (error) {
    console.error('Error deleting package:', error)
    return NextResponse.json(
      { error: 'Failed to delete package' },
      { status: 500 }
    )
  }
}
