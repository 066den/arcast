import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const serviceTypes = await prisma.serviceType.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    })

    return NextResponse.json(serviceTypes)
  } catch (error) {
    console.error('Error fetching service types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service types' },
      { status: 500 }
    )
  }
}
