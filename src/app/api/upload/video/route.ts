import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { uploadToS3 } from '@/lib/s3'
import { validateVideoFile } from '@/lib/validate'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('videoFile') as File
    const folder = formData.get('folder') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      )
    }

    const validation = validateVideoFile(file)
    if (validation) {
      return NextResponse.json({ error: validation }, { status: 400 })
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

    return NextResponse.json({
      success: true,
      message: 'Video uploaded successfully',
      videoUrl: result.cdnUrl,
      originalName: file.name,
      size: file.size,
    })
  } catch (error) {
    console.error('Error uploading video:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
