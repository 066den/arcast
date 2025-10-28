import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
// Defer S3 import to runtime to avoid module evaluation during build analysis

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

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
    // Lazy-load to prevent build-time evaluation (helps with "Failed to collect page data")
    const { generatePresignedPost } = await import('@/lib/s3')

    

    const session = await auth()
    if (!session?.user) {
      
      const response = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    

    const body = await request.json()
    const { fileName, contentType, folder, maxFileSize } = body

    if (!fileName) {
      
      const response = NextResponse.json(
        { error: 'File name is required' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    

    const presignedPost = await generatePresignedPost(fileName, {
      folder: folder || 'samples',
      contentType,
      expiresIn: 3600, // 1 hour
      maxFileSize: maxFileSize || 500 * 1024 * 1024, // 500MB default
    })

    

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
    

    // More detailed error logging
    if (error instanceof Error) {
      
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
