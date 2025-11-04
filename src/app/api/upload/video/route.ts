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
    const startTime = Date.now()

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

    // Use S3 for video uploads
    const s3 = await import('@/lib/s3')

    // For MinIO, always use direct upload via MinIO client (more reliable than presigned POST)
    const endpoint = process.env.AWS_ENDPOINT || ''
    const isMinIO =
      endpoint.includes('minio') ||
      endpoint.includes('localhost') ||
      endpoint.includes('127.0.0.1')

    // Always use direct upload for MinIO to avoid presigned POST signature issues
    const usePresignedPost = false // Disable presigned POST for MinIO

    console.log('Video upload decision:', {
      endpoint,
      isMinIO,
      fileSize: file.size,
      usePresignedPost,
    })

    if (usePresignedPost) {
      console.log('Using presigned POST for large file upload')
      // Generate presigned POST for direct client upload (bypasses signature issues)
      const presignedPost = await s3.generatePresignedPost(fileName, {
        folder: folder || 'samples',
        contentType: file.type,
        expiresIn: 3600, // 1 hour
        maxFileSize: 1024 * 1024 * 1024, // 1GB
      })

      const response = NextResponse.json({
        success: true,
        message: 'Presigned POST generated for video upload',
        presignedPost: {
          url: presignedPost.url,
          fields: presignedPost.fields,
          fileKey: presignedPost.fileKey,
          cdnUrl: presignedPost.cdnUrl,
        },
        videoUrl: presignedPost.cdnUrl, // For compatibility with client code
        originalName: file.name,
        size: file.size,
        uploadMethod: 'presigned-post',
        instructions: {
          method: 'POST',
          description: 'Upload file directly to S3 using presigned POST',
          note: 'This bypasses signature issues with MinIO for large files',
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
    }

    // Direct upload to S3 for small files or non-MinIO providers
    const uploadStartTime = Date.now()

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
    // More detailed error logging
    console.error('Video upload error:', error)

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined

    const response = NextResponse.json(
      {
        error: 'Internal server error',
        details:
          process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        ...(process.env.NODE_ENV === 'development' &&
          errorStack && {
            stack: errorStack,
          }),
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
