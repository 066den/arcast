import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { getUploadedFile } from '@/utils/files'
import { validateFile } from '@/lib/validate'
import { normalizeVideoUrl } from '@/lib/s3'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const sample = await prisma.sample.findUnique({
      where: { id },
      include: {
        serviceType: true,
      },
    })

    if (!sample) {
      return NextResponse.json({ error: 'Sample not found' }, { status: 404 })
    }

    // Normalize video URL to ensure consistent format
    const normalizedSample = {
      ...sample,
      videoUrl: normalizeVideoUrl(sample.videoUrl),
    }

    return NextResponse.json(normalizedSample)
  } catch (error) {
    console.error('Error fetching sample:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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

    // Check if request contains form data (file upload)
    const contentType = request.headers.get('content-type')
    let name: string
    let thumbUrl: string | null = null
    let videoUrl: string | null = null
    let serviceTypeId: string | null = null

    if (contentType?.includes('multipart/form-data')) {
      // Handle form data with file upload
      const formData = await request.formData()
      name = formData.get('name') as string
      videoUrl = formData.get('videoUrl') as string
      serviceTypeId = formData.get('serviceTypeId') as string

      const thumbnailFile = formData.get('thumbnailFile') as File

      if (!name) {
        return NextResponse.json(
          { error: 'Sample name is required' },
          { status: 400 }
        )
      }

      // Handle thumbnail file upload
      if (thumbnailFile && thumbnailFile.size > 0) {
        const validation = validateFile(thumbnailFile)
        if (validation) {
          return NextResponse.json({ error: validation }, { status: 400 })
        }

        try {
          thumbUrl = await getUploadedFile(thumbnailFile, 'samples')
        } catch (error) {
          console.error('Error uploading thumbnail:', error)
          return NextResponse.json(
            { error: 'Failed to upload thumbnail' },
            { status: 400 }
          )
        }
      }
    } else {
      // Handle JSON data
      const body = await request.json()
      name = body.name
      thumbUrl = body.thumbUrl || null
      videoUrl = body.videoUrl || null
      serviceTypeId = body.serviceTypeId || null

      if (!name) {
        return NextResponse.json(
          { error: 'Sample name is required' },
          { status: 400 }
        )
      }
    }

    const updateData: {
      name: string
      videoUrl: string | null
      serviceTypeId: string | null
      thumbUrl?: string | null
    } = {
      name,
      videoUrl, // Store as provided - will be normalized on retrieval
      serviceTypeId: serviceTypeId || null,
    }

    // Only update thumbUrl if we have a new thumbnail file
    if (thumbUrl) {
      updateData.thumbUrl = thumbUrl
    }

    const sample = await prisma.sample.update({
      where: { id },
      data: updateData,
      include: {
        serviceType: true,
      },
    })

    // Return normalized URL
    const normalizedSample = {
      ...sample,
      videoUrl: normalizeVideoUrl(sample.videoUrl),
    }

    return NextResponse.json(normalizedSample)
  } catch (error) {
    console.error('Error updating sample:', error)
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

    await prisma.sample.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting sample:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
