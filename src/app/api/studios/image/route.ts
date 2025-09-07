import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateStudioImageUpload } from '@/lib/schemas'
import { HTTP_STATUS } from '@/lib/constants'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Data validation
    const validation = validateStudioImageUpload(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.issues,
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    const { studioId, imageUrl } = validation.data

    // Check if studio exists
    const existingStudio = await prisma.studio.findUnique({
      where: { id: studioId },
    })

    if (!existingStudio) {
      return NextResponse.json({ error: 'Studio not found' }, { status: 404 })
    }

    // Update studio image
    const updatedStudio = await prisma.studio.update({
      where: { id: studioId },
      data: { imageUrl },
      include: {
        packages: {
          include: {
            packagePerks: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Studio image updated successfully',
      studio: updatedStudio,
    })
  } catch (error) {
    console.error('Error updating studio image:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Method for deleting studio image
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const studioId = searchParams.get('studioId')

    if (!studioId) {
      return NextResponse.json(
        { error: 'Studio ID is required' },
        { status: 400 }
      )
    }

    // Check if studio exists
    const existingStudio = await prisma.studio.findUnique({
      where: { id: studioId },
    })

    if (!existingStudio) {
      return NextResponse.json({ error: 'Studio not found' }, { status: 404 })
    }

    // Remove studio image (set to null)
    const updatedStudio = await prisma.studio.update({
      where: { id: studioId },
      data: { imageUrl: '' },
      include: {
        packages: {
          include: {
            packagePerks: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Studio image removed successfully',
      studio: updatedStudio,
    })
  } catch (error) {
    console.error('Error removing studio image:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
