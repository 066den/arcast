import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { getUploadedFile } from '@/utils/files'
import { validateFile } from '@/lib/validate'
//import { normalizeVideoUrl } from '@/lib/s3'

export async function GET() {
  try {
    const samples = await prisma.sample.findMany({
      include: {
        serviceType: true,
      },
      orderBy: {
        id: 'desc',
      },
    })

    // Normalize video URLs to ensure consistent format
    const normalizedSamples = samples.map(sample => ({
      ...sample,
      videoUrl: sample.videoUrl//normalizeVideoUrl(sample.videoUrl),
    }))

    return NextResponse.json(normalizedSamples)
  } catch (error) {
    console.error('Samples fetch error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if request contains form data (file upload)
    const contentType = req.headers.get('content-type')
    let name: string
    let thumbUrl: string | null = null
    let videoUrl: string | null = null
    let serviceTypeId: string | null = null

    if (contentType?.includes('multipart/form-data')) {
      // Handle form data with file upload
      const formData = await req.formData()
      name = formData.get('name') as string
      const videoUrlValue = formData.get('videoUrl') as string
      videoUrl = videoUrlValue && videoUrlValue.trim() ? videoUrlValue.trim() : null
      const serviceTypeIdValue = formData.get('serviceTypeId') as string
      serviceTypeId = serviceTypeIdValue && serviceTypeIdValue.trim() ? serviceTypeIdValue.trim() : null

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
          console.error('Thumbnail upload error:', error)
          return NextResponse.json(
            { 
              error: 'Failed to upload thumbnail',
              details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
            },
            { status: 400 }
          )
        }
      }
    } else {
      // Handle JSON data
      const body = await req.json()
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

    // Normalize video URL before storing in DB (convert empty strings to null)
    const normalizedVideoUrl = videoUrl && typeof videoUrl === 'string' && videoUrl.trim() ? videoUrl.trim() : null

    const sample = await prisma.sample.create({
      data: {
        name,
        thumbUrl,
        videoUrl: normalizedVideoUrl, // Store normalized URL
        serviceTypeId: serviceTypeId || null,
      },
      include: {
        serviceType: true,
      },
    })

    return NextResponse.json(sample)
  } catch (error) {
    console.error('Sample create error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
