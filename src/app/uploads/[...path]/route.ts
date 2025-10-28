import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathArray } = await params
    const filePath = pathArray.join('/')

    // Security: prevent path traversal
    if (filePath.includes('..')) {
      return new NextResponse('Invalid path', { status: 400 })
    }

    const fullPath = join(process.cwd(), 'public', 'uploads', filePath)

    // Check if file exists
    if (!existsSync(fullPath)) {
      return new NextResponse('File not found', { status: 404 })
    }

    // Read and serve the file
    const fileBuffer = await readFile(fullPath)
    const ext = filePath.split('.').pop()?.toLowerCase()

    // Determine content type
    const contentTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      mp4: 'video/mp4',
      mp3: 'audio/mpeg',
    }

    const contentType = contentTypes[ext || ''] || 'application/octet-stream'

    return new NextResponse(fileBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': contentType,
      },
    })
  } catch (error) {
    
    return new NextResponse('Internal server error', { status: 500 })
  }
}
