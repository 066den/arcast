import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  try {
    const samples = await prisma.sample.findMany({
      include: {
        serviceType: true,
      },
      orderBy: {
        id: 'desc',
      },
    })

    return NextResponse.json(samples)
  } catch (error) {
    console.error('Error fetching samples:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, thumbUrl, videoUrl, serviceTypeId } = body

    const sample = await prisma.sample.create({
      data: {
        name,
        thumbUrl,
        videoUrl,
        serviceTypeId: serviceTypeId || null,
      },
      include: {
        serviceType: true,
      },
    })

    return NextResponse.json(sample)
  } catch (error) {
    console.error('Error creating sample:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
