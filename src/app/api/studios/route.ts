import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getStudios } from '@/services/studioServices'
import { validateStudio } from '@/lib/schemas'

export async function GET() {
  try {
    const studiosWithAvailability = await getStudios()
    return NextResponse.json(studiosWithAvailability)
  } catch (error) {
    console.error('Error fetching studios:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  const {
    name,
    location,
    imageUrl,
    totalSeats,
    openingTime,
    closingTime,
    packages,
  } = await req.json()

  const studio = await prisma.$transaction(async tx => {
    // 1. Create the studio
    const newStudio = await tx.studio.create({
      data: {
        name,
        location,
        imageUrl,
        totalSeats,
        openingTime,
        closingTime,
      },
    })

    // Get default packages
    const defaultPackages = await tx.studioPackage.findMany({
      where: {
        studios: {
          none: {},
        },
      },
    })

    // Connect default packages to the studio
    await tx.studio.update({
      where: { id: newStudio.id },
      data: {
        packages: {
          connect: defaultPackages.map(pkg => ({ id: pkg.id })),
        },
      },
    })

    // 2. Create additional custom packages if provided
    if (packages && packages.length > 0) {
      await Promise.all(
        packages.map(
          async (pkg: {
            name: string
            pricePerHour: number | string
            currency?: string
            description: string
            deliveryTime: number
            perks?: { name: string; count: number }[]
          }) => {
            const newPackage = await tx.studioPackage.create({
              data: {
                name: pkg.name,
                price_per_hour: pkg.pricePerHour,
                currency: pkg.currency || 'AED',
                description: pkg.description,
                delivery_time: pkg.deliveryTime,
                studios: {
                  connect: { id: newStudio.id },
                },
                // Create package perks if provided
                packagePerks: pkg.perks
                  ? {
                      create: pkg.perks.map(
                        (perk: { name: string; count: number }) => ({
                          name: perk.name,
                          count: perk.count,
                        })
                      ),
                    }
                  : undefined,
              },
            })
            return newPackage
          }
        )
      )
    }

    // 3. Return the created studio with its packages
    return tx.studio.findUnique({
      where: { id: newStudio.id },
      include: {
        packages: {
          include: {
            packagePerks: true,
          },
        },
      },
    })
  })

  return NextResponse.json(studio)
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Studio ID is required' },
        { status: 400 }
      )
    }

    // Data validation
    const validation = validateStudio(updateData)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.issues,
        },
        { status: 400 }
      )
    }

    // Check if studio exists
    const existingStudio = await prisma.studio.findUnique({
      where: { id },
    })

    if (!existingStudio) {
      return NextResponse.json({ error: 'Studio not found' }, { status: 404 })
    }

    // Update studio
    const updatedStudio = await prisma.studio.update({
      where: { id },
      data: validation.data,
      include: {
        packages: {
          include: {
            packagePerks: true,
          },
        },
      },
    })

    return NextResponse.json(updatedStudio)
  } catch (error) {
    console.error('Error updating studio:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
