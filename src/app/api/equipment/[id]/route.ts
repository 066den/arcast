import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { deleteUploadedFile } from '@/utils/files'
import { validateFile } from '@/lib/validate'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const equipment = await prisma.equipment.findUnique({
      where: {
        id,
      },
    })

    if (!equipment) {
      return NextResponse.json(
        { error: 'Equipment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(equipment)
  } catch (error) {
    console.error('Error fetching equipment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch equipment' },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const imageFile = formData.get('imageFile') as File

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Get existing equipment to check current image
    const existingEquipment = await prisma.equipment.findUnique({
      where: { id },
    })

    if (!existingEquipment) {
      return NextResponse.json(
        { error: 'Equipment not found' },
        { status: 404 }
      )
    }

    let imageUrl = existingEquipment.imageUrl

    // Handle new image upload
    if (imageFile && imageFile.size > 0) {
      const validation = validateFile(imageFile)
      if (validation) {
        return NextResponse.json({ error: validation }, { status: 400 })
      }

      // Delete old image if it exists (S3 or local)
      if (existingEquipment.imageUrl) {
        try {
          const oldUrl = existingEquipment.imageUrl
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

      // Upload to S3
      const s3 = await import('@/lib/s3')
      const fileExt = (imageFile.name.split('.').pop() || 'jpg').toLowerCase()
      const uniqueFileName = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${fileExt}`

      const uploadRes = await s3.uploadToS3(imageFile, uniqueFileName, {
        folder: 'equipment',
        contentType: imageFile.type,
        metadata: {
          originalName: imageFile.name,
          uploadedAt: new Date().toISOString(),
          entity: 'equipment',
          entityId: id,
        },
      })
      imageUrl = uploadRes.cdnUrl || uploadRes.url
    }

    const equipment = await prisma.equipment.update({
      where: {
        id,
      },
      data: {
        name,
        description,
        imageUrl,
      },
    })

    return NextResponse.json(equipment)
  } catch (error) {
    console.error('Error updating equipment:', error)
    return NextResponse.json(
      { error: 'Failed to update equipment' },
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

    await prisma.equipment.delete({
      where: {
        id,
      },
    })

    return NextResponse.json({ message: 'Equipment deleted successfully' })
  } catch (error) {
    console.error('Error deleting equipment:', error)
    return NextResponse.json(
      { error: 'Failed to delete equipment' },
      { status: 500 }
    )
  }
}
