import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateBlogRecord } from '@/lib/schemas'
import { ERROR_MESSAGES, HTTP_STATUS } from '@/lib/constants'

export async function GET() {
  try {
    const articles = await prisma.blogRecord.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(articles)
  } catch (error) {
    
    return NextResponse.json(
      { error: 'Failed to fetch blog articles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, tagline, mainText } = body

    const validation = validateBlogRecord({
      title,
      tagline,
      mainText,
    })
    if (!validation.success) {
      return NextResponse.json(
        {
          error: ERROR_MESSAGES.INVALID_REQUEST,
          details: validation.error.issues,
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    const article = await prisma.blogRecord.create({
      data: {
        title,
        tagline,
        mainText,
      },
    })

    return NextResponse.json(article)
  } catch (error) {
    
    return NextResponse.json(
      { error: 'Failed to create blog article' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}
