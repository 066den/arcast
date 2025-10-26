import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { validateFile } from '@/lib/validate'
import { deleteUploadedFile } from '@/utils/files'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('imageFile') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    const validation = validateFile(file)
    if (validation) {
      return NextResponse.json({ error: validation }, { status: 400 })
    }

    // Upload to S3 (lazy import to avoid build-time evaluation)
    const s3 = await import('@/lib/s3')

    const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const uniqueFileName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${fileExt}`

    const uploadRes = await s3.uploadToS3(file, uniqueFileName, {
      folder: 'samples',
      contentType: file.type,
      metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        entity: 'sample',
        entityId: id,
      },
    })
    const imageUrl = uploadRes.cdnUrl || uploadRes.url

    const updatedSample = await prisma.sample.update({
      where: { id },
      data: {
        thumbUrl: imageUrl,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Sample image uploaded successfully',
      imageUrl: imageUrl,
      sample: updatedSample,
    })
  } catch (error) {
    console.error('Error uploading sample image:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sample = await prisma.sample.findUnique({
      where: { id },
    })

    if (!sample) {
      return NextResponse.json({ error: 'Sample not found' }, { status: 404 })
    }

    if (sample.thumbUrl) {
      try {
        const oldUrl = sample.thumbUrl
        const { isS3Url, extractFileKeyFromUrl, deleteFromS3 } = await import('@/lib/s3')
        if (isS3Url(oldUrl)) {
          const key = extractFileKeyFromUrl(oldUrl)
          if (key) {
            await deleteFromS3(key)
          }
        } else {
          await deleteUploadedFile(oldUrl)
        }
      } catch {}
    }

    const updatedSample = await prisma.sample.update({
      where: { id },
      data: {
        thumbUrl: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Sample image removed successfully',
      sample: updatedSample,
    })
  } catch (error) {
    console.error('Error removing sample image:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
