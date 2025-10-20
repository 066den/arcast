import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/case-studies - Fetch all case studies
export async function GET() {
  try {
    const caseStudies = await prisma.caseStudy.findMany({
      include: {
        client: true,
        staff: true,
        equipment: true,
        caseContent: {
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    })

    return NextResponse.json(caseStudies)
  } catch (error) {
    console.error('Error fetching case studies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch case studies' },
      { status: 500 }
    )
  }
}

// POST /api/case-studies - Create a new case study
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      tagline,
      mainText,
      clientId,
      staffIds = [],
      equipmentIds = [],
      imageUrls = [],
      caseContent = [],
    } = body

    const caseStudy = await prisma.caseStudy.create({
      data: {
        title,
        tagline,
        mainText,
        clientId: clientId || null,
        imageUrls,
        staff: {
          connect: staffIds.map((id: string) => ({ id })),
        },
        equipment: {
          connect: equipmentIds.map((id: string) => ({ id })),
        },
        caseContent: {
          create: (
            caseContent as Array<{
              title: string
              text?: string[]
              list?: string[]
              imageUrl?: string
              order?: number
            }>
          ).map((content, index: number) => ({
            title: content.title,
            text: content.text || [],
            list: content.list || [],
            imageUrl: content.imageUrl ?? '',
            order: content.order ?? index,
          })),
        },
      },
      include: {
        client: true,
        staff: true,
        equipment: true,
        caseContent: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    })

    return NextResponse.json(caseStudy, { status: 201 })
  } catch (error) {
    console.error('Error creating case study:', error)
    return NextResponse.json(
      { error: 'Failed to create case study' },
      { status: 500 }
    )
  }
}
