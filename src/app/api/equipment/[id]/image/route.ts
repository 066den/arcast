import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { validateFile } from '@/lib/validate'
import { deleteUploadedFile } from '@/utils/files'

// Ensure this route runs on Node.js runtime and is not statically optimized
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
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

    // Lazy-load S3 helpers to avoid build-time evaluation
    const s3 = await import('@/lib/s3')

    const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const uniqueFileName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${fileExt}`

    const uploadRes = await s3.uploadToS3(file, uniqueFileName, {
      folder: 'equipment',
      contentType: file.type,
      metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        entity: 'equipment',
        entityId: id,
      },
    })

    const imageUrl = uploadRes.cdnUrl || uploadRes.url

    const existingEquipment = await prisma.equipment.findUnique({
      where: { id },
    })

    if (!existingEquipment) {
      return NextResponse.json(
        { error: 'Equipment not found' },
        { status: 404 }
      )
    }

    if (existingEquipment.imageUrl) {
      try {
        const oldUrl = existingEquipment.imageUrl
        // If old URL was already on S3/Spaces -> delete from bucket, otherwise delete local file
        if ((await import('@/lib/s3')).isS3Url(oldUrl)) {
          const { extractFileKeyFromUrl, deleteFromS3 } = await import('@/lib/s3')
          const key = extractFileKeyFromUrl(oldUrl)
          if (key) {
            await deleteFromS3(key)
          }
        } else {
          await deleteUploadedFile(oldUrl)
        }
      } catch {}
    }

    const updatedEquipment = await prisma.equipment.update({
      where: { id },
      data: { imageUrl },
    })

    return NextResponse.json({
      success: true,
      message: 'Equipment image updated successfully',
      equipment: updatedEquipment,
    })
  } catch (error) {
    console.error('Error updating equipment image:', error)
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
  const { id } = await params

  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existingEquipment = await prisma.equipment.findUnique({
      where: { id },
    })

    if (!existingEquipment) {
      return NextResponse.json(
        { error: 'Equipment not found' },
        { status: 404 }
      )
    }

    if (existingEquipment.imageUrl) {
      try {
        const oldUrl = existingEquipment.imageUrl
        if ((await import('@/lib/s3')).isS3Url(oldUrl)) {
          const { extractFileKeyFromUrl, deleteFromS3 } = await import('@/lib/s3')
          const key = extractFileKeyFromUrl(oldUrl)
          if (key) {
            await deleteFromS3(key)
          }
        } else {
          await deleteUploadedFile(oldUrl)
        }
      } catch {}
    }

    const updatedEquipment = await prisma.equipment.update({
      where: { id },
      data: { imageUrl: null },
    })

    return NextResponse.json({
      success: true,
      message: 'Equipment image removed successfully',
      equipment: updatedEquipment,
    })
  } catch (error) {
    console.error('Error removing equipment image:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
