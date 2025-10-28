import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ERROR_MESSAGES, HTTP_STATUS } from '@/lib/constants'
import { validateFile } from '@/lib/validate'
import { getUploadedFile, deleteUploadedFile } from '@/utils/files'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

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

    // Upload to S3
    const imageUrl = await getUploadedFile(file, 'studios')

    const existingStudio = await prisma.studio.findUnique({
      where: { id },
    })

    if (!existingStudio) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.STUDIO.NOT_FOUND },
        { status: 404 }
      )
    }

    if (existingStudio.imageUrl) {
      try {
        await deleteUploadedFile(existingStudio.imageUrl)
      } catch {}
    }

    const updatedStudio = await prisma.studio.update({
      where: { id },
      data: { imageUrl },
    })

    return NextResponse.json({
      success: true,
      message: 'Studio image updated successfully',
      studio: updatedStudio,
    })
  } catch (error) {
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
      return NextResponse.json(
        { error: ERROR_MESSAGES.STUDIO.NOT_FOUND },
        { status: 404 }
      )
    }

    // Remove image from storage before clearing reference
    if (existingStudio.imageUrl) {
      try {
        await deleteUploadedFile(existingStudio.imageUrl)
      } catch {}
    }

    // Remove studio image (clear field)
    const updatedStudio = await prisma.studio.update({
      where: { id: studioId },
      data: { imageUrl: '' },
    })

    return NextResponse.json({
      success: true,
      message: 'Studio image removed successfully',
      studio: updatedStudio,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
