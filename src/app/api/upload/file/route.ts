import { NextResponse } from 'next/server'
import { validateFileByType } from '@/lib/validate'
import { getUploadedFileGeneric } from '@/utils/files'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const fileType = formData.get('fileType') as
      | 'image'
      | 'video'
      | 'audio'
      | 'document'
    const folder = formData.get('folder') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!fileType) {
      return NextResponse.json(
        { error: 'File type must be specified' },
        { status: 400 }
      )
    }

    const validation = validateFileByType(file, fileType)

    if (validation) {
      return NextResponse.json({ error: validation }, { status: 400 })
    }

    const fileUrl = await getUploadedFileGeneric(file, folder || 'files')
    if (!fileUrl) {
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      fileUrl,
      fileType,
      originalName: file.name,
      size: file.size,
    })
  } catch (error) {
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
