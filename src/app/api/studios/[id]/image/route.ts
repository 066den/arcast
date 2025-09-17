import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

import { HTTP_STATUS } from '@/lib/constants'
import { validateFile } from '@/lib/validate'
import { getUploadedFile } from '@/utils/files'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const formData = await req.formData()
    const file = formData.get('imageFile') as File

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    const validation = validateFile(file)

    if (validation) {
      return NextResponse.json({ error: validation }, { status: 400 })
    }

    const imageUrl = await getUploadedFile(file, 'studios')
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 400 }
      )
    }

    const existingStudio = await prisma.studio.findUnique({
      where: { id },
    })

    if (!existingStudio) {
      return NextResponse.json({ error: 'Studio not found' }, { status: 404 })
    }

    const updatedStudio = await prisma.studio.update({
      where: { id },
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
