import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { validateFile } from '@/lib/validate'
import { getUploadedFile, deleteUploadedFile } from '@/utils/files'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) || 'images'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const validation = validateFile(file)
    if (validation) {
      return NextResponse.json({ error: validation }, { status: 400 })
    }

    // Upload file to S3
    const fileUrl = await getUploadedFile(file, folder)

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully',
      fileUrl,
    })
  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details:
          process.env.NODE_ENV === 'development' && error instanceof Error
            ? error.message
            : undefined,
      },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const fileUrl = searchParams.get('fileUrl')

    if (!fileUrl) {
      return NextResponse.json(
        { error: 'File URL not provided' },
        { status: 400 }
      )
    }

    // Delete file from S3 or local storage
    const deleted = await deleteUploadedFile(fileUrl)

    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete file' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    })
  } catch (error) {
    console.error('File deletion error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details:
          process.env.NODE_ENV === 'development' && error instanceof Error
            ? error.message
            : undefined,
      },
      { status: 500 }
    )
  }
}
