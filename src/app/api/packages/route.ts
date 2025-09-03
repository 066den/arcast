import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const packages = await prisma.studioPackage.findMany({
      include: {
        packagePerks: true,
        studios: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        price_per_hour: 'asc',
      },
    })

    // Transform the data to match the frontend expectations
    const transformedPackages = packages.map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      pricePerHour: pkg.price_per_hour.toString(),
      currency: pkg.currency,
      description: pkg.description,
      deliveryTime: pkg.delivery_time,
      features: pkg.packagePerks.map(perk => 
        perk.count ? `${perk.count}x ${perk.name}` : perk.name
      ),
      popular: false, // You can add logic to determine popularity
      studioIds: pkg.studios.map(studio => studio.id),
    }))

    return NextResponse.json({ 
      success: true, 
      packages: transformedPackages 
    })
  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch packages' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const { name, pricePerHour, currency, description, deliveryTime, features, studioIds } = await req.json()

    const packageData = {
      name,
      price_per_hour: parseFloat(pricePerHour),
      currency: currency || 'AED',
      description,
      delivery_time: deliveryTime,
      studios: studioIds ? {
        connect: studioIds.map((id: string) => ({ id }))
      } : undefined,
      packagePerks: features ? {
        create: features.map((feature: string) => {
          // Parse feature like "3x Sony cameras" or just "Sony cameras"
          const match = feature.match(/^(\d+)x\s+(.+)$/)
          if (match) {
            return {
              name: match[2].trim(),
              count: parseInt(match[1])
            }
          }
          return {
            name: feature,
            count: 1
          }
        })
      } : undefined,
    }

    const newPackage = await prisma.studioPackage.create({
      data: packageData,
      include: {
        packagePerks: true,
        studios: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({ 
      success: true, 
      package: newPackage 
    })
  } catch (error) {
    console.error('Error creating package:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create package' },
      { status: 500 }
    )
  }
}
