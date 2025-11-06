import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

import { ERROR_MESSAGES, HTTP_STATUS } from '@/lib/constants'
import { validateFile } from '@/lib/validate'
import { getUploadedFile } from '@/utils/files'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const formData = await req.formData()
    const file = formData.get('imageFile') as File

    if (!file) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_REQUEST },
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    const validation = validateFile(file)

    if (validation) {
      return NextResponse.json({ error: validation }, { status: 400 })
    }

    // Upload to S3
    const imageUrl = await getUploadedFile(file, 'blog')

    const existingArticle = await prisma.blogRecord.findUnique({
      where: { id },
    })

    if (!existingArticle) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.ARTICLE.NOT_FOUND },
        { status: 404 }
      )
    }

    const updatedArticle = await prisma.blogRecord.update({
      where: { id },
      data: { mainImageUrl: imageUrl },
    })

    return NextResponse.json({
      success: true,
      message: 'Article image updated successfully',
      article: updatedArticle,
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
