import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { generatePresignedPost } from '@/lib/s3'
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
    console.log('Starting presigned POST generation...')

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

    const body = await request.json()
    const { fileName, contentType, folder, maxFileSize } = body

    if (!fileName) {
      console.log('No file name provided')
      const response = NextResponse.json(
        { error: 'File name is required' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    console.log('Generating presigned POST for:', {
      fileName,
      contentType,
      folder,
      maxFileSize,
    })

    const presignedPost = await generatePresignedPost(fileName, {
      folder: folder || 'samples',
      contentType,
      expiresIn: 3600, // 1 hour
      maxFileSize: maxFileSize || 500 * 1024 * 1024, // 500MB default
    })

    console.log('Presigned POST generated successfully')

    const response = NextResponse.json({
      success: true,
      message: 'Presigned POST generated successfully',
      presignedPost: {
        url: presignedPost.url,
        fields: presignedPost.fields,
        fileKey: presignedPost.fileKey,
        cdnUrl: presignedPost.cdnUrl,
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
    console.error('Error generating presigned POST:', error)

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
