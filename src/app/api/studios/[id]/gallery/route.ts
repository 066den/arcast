import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    const existingStudio = await prisma.studio.findUnique({
      where: { id },
    })

    if (!existingStudio) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.STUDIO.NOT_FOUND },
        { status: 404 }
      )
    }

    // Upload to S3 (lazy import to avoid build-time evaluation)
    const s3 = await import('@/lib/s3')

    const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const uniqueFileName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${fileExt}`

    const uploadRes = await s3.uploadToS3(file, uniqueFileName, {
      folder: `studios/gallery/${id}`,
      contentType: file.type,
      metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        entity: 'studio-gallery',
        entityId: id,
      },
    })
    const imageUrl = uploadRes.cdnUrl || uploadRes.url

    const updatedStudio = await prisma.studio.update({
      where: { id },
      data: { gallery: [...existingStudio.gallery, imageUrl] },
    })

    return NextResponse.json(updatedStudio)
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
    const { imageUrl } = await req.json()

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
      (url: any) => url !== imageUrl
    )

    const updatedStudio = await prisma.studio.update({
      where: { id },
      data: { gallery: updatedGallery },
    })

    try {
      const { isS3Url, extractFileKeyFromUrl, deleteFromS3 } = await import('@/lib/s3')
      if (isS3Url(imageUrl)) {
        const key = extractFileKeyFromUrl(imageUrl)
        if (key) {
          await deleteFromS3(key)
        }
      } else {
        await deleteUploadedFile(imageUrl)
      }
    } catch {}

    return NextResponse.json(updatedStudio)
  } catch (error) {
    console.error('Error removing gallery image:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
