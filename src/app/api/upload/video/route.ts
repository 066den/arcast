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
    const usePresignedPost = formData.get('usePresignedPost') === 'true'

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

    // Lazy-load S3 helpers at runtime to avoid build-time evaluation
    const s3 = await import('@/lib/s3')


    if (usePresignedPost) {
      // Use presigned POST for faster uploads

      const presignedPost = await s3.generatePresignedPost(fileName, {
        folder: folder || 'samples',
        contentType: file.type,
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
        uploadMethod: 'presigned-post',
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
    } else {
      // Use multipart upload for very large files, direct upload for others
      const uploadStartTime = Date.now()
      let result: any

      if (file.size > 300 * 1024 * 1024) {
        // 300MB
        console.log('🚀 Using multipart upload for very large file:', fileName)
        try {
          result = await s3.uploadLargeFileToS3(file, fileName, {
            folder: folder || 'arcast-s3/samples',
            contentType: file.type,
            metadata: {
              originalName: file.name,
              uploadedAt: new Date().toISOString(),
              fileType: 'video',
            },
          })
        } catch (multipartError) {
          console.warn(
            '⚠️ Multipart upload failed, falling back to direct upload:',
            multipartError
          )
          console.log('📤 Falling back to direct upload:', fileName)
          result = await s3.uploadToS3(file, fileName, {
            folder: folder || 'arcast-s3/samples',
            contentType: file.type,
            metadata: {
              originalName: file.name,
              uploadedAt: new Date().toISOString(),
              fileType: 'video',
            },
          })
        }
      } else {
        console.log('📤 Using direct upload:', fileName)
        result = await s3.uploadToS3(file, fileName, {
          folder: folder || 'arcast-s3/samples',
          contentType: file.type,
          metadata: {
            originalName: file.name,
            uploadedAt: new Date().toISOString(),
            fileType: 'video',
          },
        })
      }

      const uploadEndTime = Date.now()
      const uploadDuration = (uploadEndTime - uploadStartTime) / 1000
      console.log(
        `✅ Upload successful in ${uploadDuration.toFixed(2)}s:`,
        result.url
      )

      const response = NextResponse.json({
        success: true,
        message: 'Video uploaded successfully',
        videoUrl: result.cdnUrl,
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
    }
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
