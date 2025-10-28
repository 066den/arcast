import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
// S3 helper будет импортирован лениво внутри обработчика, чтобы избежать выполнения на этапе сборки
import { validateVideoFile } from '@/lib/validate'
import { v4 as uuidv4 } from 'uuid'

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

    

    // Ленивый импорт S3-хелпера, чтобы исключить выполнение кода при анализе сборки
    const { generatePresignedPost } = await import('@/lib/s3')

    // Generate presigned POST for direct upload
    const presignedPost = await generatePresignedPost(fileName, {
      folder: folder || 'samples',
      contentType: file.type,
      expiresIn: 3600, // 1 hour
      maxFileSize: 1024 * 1024 * 1024, // 1GB for large videos
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
