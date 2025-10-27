import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { validateVideoFile } from '@/lib/validate'
import { v4 as uuidv4 } from 'uuid'

// Configure body size limit for large video uploads
export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes for large video uploads
export const dynamic = 'force-dynamic' // Disable static optimization for file uploads

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
    console.log('Starting video upload process...')
    const startTime = Date.now()

    const session = await auth()
    if (!session?.user) {
      console.log('Unauthorized access attempt')
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

    // Use S3 for video uploads
    const s3 = await import('@/lib/s3')

    // Direct upload to S3
    const uploadStartTime = Date.now()
    console.log('📤 Uploading video to S3:', fileName)

    const result = await s3.uploadToS3(file, fileName, {
      folder: folder || 'samples',
      contentType: file.type,
      metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        fileType: 'video',
      },
    })

    const uploadEndTime = Date.now()
    const uploadDuration = (uploadEndTime - uploadStartTime) / 1000
    console.log(
      `✅ Upload successful in ${uploadDuration.toFixed(2)}s:`,
      result.url
    )

    const response = NextResponse.json({
      success: true,
      message: 'Video uploaded successfully',
      videoUrl: result.cdnUrl || result.url,
      originalName: file.name,
      size: file.size,
      uploadMethod: 'direct',
      uploadDuration: uploadDuration,
      totalDuration: (Date.now() - startTime) / 1000,
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

    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      })
    }

    const response = NextResponse.json(
      {
        error: 'Internal server error',
        details:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.message
              : 'Unknown error'
            : undefined,
      },
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
