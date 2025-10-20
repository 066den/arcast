import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  try {
    const sample = await prisma.sample.findUnique({
      where: { id },
      include: {
        serviceType: true,
      },
    })

    if (!sample) {
      return NextResponse.json({ error: 'Sample not found' }, { status: 404 })
    }

    return NextResponse.json(sample)
  } catch (error) {
    console.error('Error fetching sample:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, thumbUrl, videoUrl, serviceTypeId } = body

    const sample = await prisma.sample.update({
      where: { id },
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
    console.error('Error updating sample:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.sample.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting sample:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
