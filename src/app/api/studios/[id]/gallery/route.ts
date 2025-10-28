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

    const existingStudio = await prisma.studio.findUnique({
      where: { id },
    })

    if (!existingStudio) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.STUDIO.NOT_FOUND },
        { status: 404 }
      )
    }

    // Upload to S3
    const imageUrl = await getUploadedFile(file, 'studios/gallery')

    const updatedStudio = await prisma.studio.update({
      where: { id },
      data: { gallery: [...existingStudio.gallery, imageUrl] },
    })

    return NextResponse.json(updatedStudio)
  } catch (error) {
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
      const { isS3Url, extractFileKeyFromUrl, deleteFromS3 } = await import(
        '@/lib/s3'
      )
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
