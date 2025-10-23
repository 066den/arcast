import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Check if Prisma client is available
    if (!prisma) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 503 }
      )
    }

    const packages = await prisma.package.findMany({
      include: {
        servicePackageRecords: {
          include: {
            includedService: true,
          },
        },
      },
      orderBy: {
        basePrice: 'asc',
      },
    })
    // Transform the data to match the frontend expectations
    const transformedPackages = packages.map((pkg: any) => ({
      id: pkg.id,
      name: pkg.name,
      pricePerHour: pkg.basePrice.toString(),
      currency: pkg.currency,
      description: pkg.description,
      deliveryTime: '24-48 hours', // Default delivery time
      features: pkg.servicePackageRecords.map((record: any) =>
        record.serviceQuantity > 1
          ? `${record.serviceQuantity}x ${record.includedService.name}`
          : record.includedService.name
      ),
      popular: false, // You can add logic to determine popularity
      studioIds: [], // Packages are not directly linked to studios in current schema
    }))
    return NextResponse.json({
      success: true,
      packages: transformedPackages,
    })
  } catch (error) {
    console.error('Error fetching packages:', error)

    // If it's a database connection error, return a more specific message
    if (error instanceof Error && error.message.includes('connect')) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Database connection failed. Please check your database configuration.',
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch packages' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const { name, pricePerHour, currency, description } = await req.json()
    const packageData = {
      name,
      basePrice: parseFloat(pricePerHour),
      currency: currency || 'AED',
      description,
    }
    const newPackage = await prisma.package.create({
      data: packageData,
      include: {
        servicePackageRecords: {
          include: {
            includedService: true,
          },
        },
      },
    })
    return NextResponse.json({
      success: true,
      package: newPackage,
    })
  } catch (error) {
    console.error('Error creating package:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create package' },
      { status: 500 }
    )
  }
}
