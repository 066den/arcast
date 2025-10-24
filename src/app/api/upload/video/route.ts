import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { uploadToS3 } from '@/lib/s3'
import { validateVideoFile } from '@/lib/validate'
import { v4 as uuidv4 } from 'uuid'

// Configure body size limit for large video uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1gb', // Allow up to 1GB for video uploads
    },
  },
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      const response = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    const formData = await request.formData()
    const file = formData.get('videoFile') as File
    const folder = formData.get('folder') as string

    if (!file) {
      const response = NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    const validation = validateVideoFile(file)
    if (validation) {
      const response = NextResponse.json({ error: validation }, { status: 400 })
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    const fileExtension = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExtension}`

    const result = await uploadToS3(file, fileName, {
      folder: folder || 'samples',
      contentType: file.type,
      metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        fileType: 'video',
      },
    })

    const response = NextResponse.json({
      success: true,
      message: 'Video uploaded successfully',
      videoUrl: result.cdnUrl,
      originalName: file.name,
      size: file.size,
    })

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    )

    return response
  } catch (error) {
    console.error('Error uploading video:', error)
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )

    // Add CORS headers to error response
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    )

    return response
  }
}
