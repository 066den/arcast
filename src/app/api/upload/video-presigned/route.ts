import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { generatePresignedPost } from '@/lib/s3'
import { validateVideoFile } from '@/lib/validate'
import { v4 as uuidv4 } from 'uuid'

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
    console.log('Starting presigned POST video upload process...')

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

    console.log('User authenticated:', session.user.email)

    const formData = await request.formData()
    const file = formData.get('videoFile') as File
    const folder = formData.get('folder') as string

    if (!file) {
      console.log('No video file provided in request')
      const response = NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    console.log('File received:', {
      name: file.name,
      size: file.size,
      type: file.type,
    })

    const validation = validateVideoFile(file)
    if (validation) {
      console.log('File validation failed:', validation)
      const response = NextResponse.json({ error: validation }, { status: 400 })
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    const fileExtension = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExtension}`

    console.log('Generating presigned POST for:', fileName)

    // Generate presigned POST for direct upload
    const presignedPost = await generatePresignedPost(fileName, {
      folder: folder || 'samples',
      contentType: file.type,
      metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        uploadedBy: session.user.email || 'unknown',
        fileType: 'video',
        fileSize: file.size.toString(),
      },
      expiresIn: 3600, // 1 hour
      maxFileSize: 1024 * 1024 * 1024, // 1GB for large videos
    })

    console.log('Presigned POST generated successfully')

    const response = NextResponse.json({
      success: true,
      message: 'Presigned POST generated for video upload',
      presignedPost: {
        url: presignedPost.url,
        fields: presignedPost.fields,
        fileKey: presignedPost.fileKey,
        cdnUrl: presignedPost.cdnUrl,
      },
      originalName: file.name,
      size: file.size,
      instructions: {
        method: 'POST',
        description: 'Upload file directly to S3 using presigned POST',
        note: 'This is more efficient for large video files',
      },
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
    console.error('Error generating presigned POST for video:', error)

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
