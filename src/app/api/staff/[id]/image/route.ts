import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
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

    // Lazy-load S3 helpers at runtime
    const s3 = await import('@/lib/s3')

    const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const uniqueFileName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${fileExt}`

    const uploadRes = await s3.uploadToS3(file, uniqueFileName, {
      folder: 'staff',
      contentType: file.type,
      metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        entity: 'staff',
        entityId: id,
      },
    })

    const imageUrl = uploadRes.cdnUrl || uploadRes.url

    const existingStaff = await prisma.staff.findUnique({
      where: { id },
    })

    if (!existingStaff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 })
    }

    if (existingStaff.imageUrl) {
      try {
        const oldUrl = existingStaff.imageUrl
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

    const updatedStaff = await prisma.staff.update({
      where: { id },
      data: { imageUrl },
    })

    return NextResponse.json({
      success: true,
      message: 'Staff image updated successfully',
      staff: updatedStaff,
    })
  } catch (error) {
    console.error('Error updating staff image:', error)
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

    const existingStaff = await prisma.staff.findUnique({
      where: { id },
    })

    if (!existingStaff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 })
    }

    if (existingStaff.imageUrl) {
      try {
        const oldUrl = existingStaff.imageUrl
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

    const updatedStaff = await prisma.staff.update({
      where: { id },
      data: { imageUrl: null },
    })

    return NextResponse.json({
      success: true,
      message: 'Staff image removed successfully',
      staff: updatedStaff,
    })
  } catch (error) {
    console.error('Error removing staff image:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
