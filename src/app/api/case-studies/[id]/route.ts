import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/case-studies/[id] - Fetch a specific case study
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const caseStudy = await prisma.caseStudy.findUnique({
      where: { id },
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

    if (!caseStudy) {
      return NextResponse.json(
        { error: 'Case study not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(caseStudy)
  } catch (error) {
    
    return NextResponse.json(
      { error: 'Failed to fetch case study' },
      { status: 500 }
    )
  }
}

// PATCH /api/case-studies/[id] - Update a case study
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      title,
      tagline,
      mainText,
      clientId,
      staffIds,
      equipmentIds,
      imageUrls,
      isActive,
      caseContent,
    } = body

    // First, get the current case study to handle relations properly
    const currentCaseStudy = await prisma.caseStudy.findUnique({
      where: { id },
      include: {
        staff: true,
        equipment: true,
      },
    })

    if (!currentCaseStudy) {
      return NextResponse.json(
        { error: 'Case study not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {}

    if (title !== undefined) updateData.title = title
    if (tagline !== undefined) updateData.tagline = tagline
    if (mainText !== undefined) updateData.mainText = mainText
    if (clientId !== undefined) updateData.clientId = clientId
    if (imageUrls !== undefined) updateData.imageUrls = imageUrls
    if (isActive !== undefined) updateData.isActive = isActive

    // Handle staff relations
    if (staffIds !== undefined) {
      updateData.staff = {
        set: staffIds.map((staffId: string) => ({ id: staffId })),
      }
    }

    // Handle equipment relations
    if (equipmentIds !== undefined) {
      updateData.equipment = {
        set: equipmentIds.map((equipmentId: string) => ({ id: equipmentId })),
      }
    }

    // Handle case content updates
    if (caseContent !== undefined) {
      // Delete existing content
      await prisma.caseStudyContent.deleteMany({
        where: { caseStudyId: id },
      })

      // Create new content
      updateData.caseContent = {
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
          imageUrl: content.imageUrl,
          order: content.order ?? index,
        })),
      }
    }

    const updatedCaseStudy = await prisma.caseStudy.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(updatedCaseStudy)
  } catch (error) {
    
    return NextResponse.json(
      { error: 'Failed to update case study' },
      { status: 500 }
    )
  }
}

// DELETE /api/case-studies/[id] - Delete a case study
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if case study exists
    const caseStudy = await prisma.caseStudy.findUnique({
      where: { id },
    })

    if (!caseStudy) {
      return NextResponse.json(
        { error: 'Case study not found' },
        { status: 404 }
      )
    }

    // Delete the case study (caseContent will be deleted automatically due to onDelete: Cascade)
    await prisma.caseStudy.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Case study deleted successfully' })
  } catch (error) {
    
    return NextResponse.json(
      { error: 'Failed to delete case study' },
      { status: 500 }
    )
  }
}
