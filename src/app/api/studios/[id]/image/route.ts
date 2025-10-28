import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

import { ERROR_MESSAGES, HTTP_STATUS } from '@/lib/constants'
import { validateFile } from '@/lib/validate'
import { deleteUploadedFile } from '@/utils/files'

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

    // Upload to local uploads directory
    const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const uniqueFileName = `${uuidv4()}.${fileExt}`

    const buffer = Buffer.from(await file.arrayBuffer())
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'studios')
    const uploadPath = join(uploadDir, uniqueFileName)

    await mkdir(uploadDir, { recursive: true })
    await writeFile(uploadPath, buffer)

    const imageUrl = `/uploads/studios/${uniqueFileName}`

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
    console.error('Error removing studio image:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
