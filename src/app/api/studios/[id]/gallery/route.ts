import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

import { ERROR_MESSAGES, HTTP_STATUS } from '@/lib/constants'
import { validateFile } from '@/lib/validate'
import { getUploadedFile, deleteUploadedFile } from '@/utils/files'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const formData = await req.formData()
    const file = formData.get('imageFile') as File

    if (!file) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_REQUEST },
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    const validation = validateFile(file)

    if (validation) {
      return NextResponse.json({ error: validation }, { status: 400 })
    }

    const existingStudio = await prisma.studio.findUnique({
      where: { id },
    })

    if (!existingStudio) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.STUDIO.NOT_FOUND },
        { status: 404 }
      )
    }

    const imageUrl = await getUploadedFile(file, `studios/gallery/${id}`)
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 400 }
      )
    }

    const updatedStudio = await prisma.studio.update({
      where: { id },
      data: { gallery: [...existingStudio.gallery, imageUrl] },
    })

    return NextResponse.json({
      success: true,
      message: 'Studio image updated successfully',
      studio: updatedStudio,
    })
  } catch (error) {
    console.error('Error updating studio gallery:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const imageUrl = searchParams.get('imageUrl')

    if (!id || !imageUrl) {
      return NextResponse.json(
        { error: 'Studio ID and image URL are required' },
        { status: 400 }
      )
    }

    const existingStudio = await prisma.studio.findUnique({
      where: { id },
    })

    if (!existingStudio) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.STUDIO.NOT_FOUND },
        { status: 404 }
      )
    }

    const updatedGallery = existingStudio.gallery.filter(
      url => url !== imageUrl
    )

    const updatedStudio = await prisma.studio.update({
      where: { id },
      data: { gallery: updatedGallery },
    })

    // Физическое удаление файла с диска
    await deleteUploadedFile(imageUrl)

    return NextResponse.json({
      success: true,
      message: 'Gallery image removed successfully',
      studio: updatedStudio,
    })
  } catch (error) {
    console.error('Error removing gallery image:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
