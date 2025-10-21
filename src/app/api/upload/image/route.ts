import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { uploadToS3 } from '@/lib/s3'
import { validateFile } from '@/lib/validate'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('imageFile') as File
    const folder = formData.get('folder') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    const validation = validateFile(file)
    if (validation) {
      return NextResponse.json({ error: validation }, { status: 400 })
    }

    const result = await uploadToS3(file, file.name, {
      folder: folder || 'images',
      contentType: file.type,
      metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        fileType: 'image',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: result.cdnUrl,
      originalName: file.name,
      size: file.size,
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
