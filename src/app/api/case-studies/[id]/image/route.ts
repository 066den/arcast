import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { validateFile } from '@/lib/validate'
import { deleteUploadedFile, getUploadedFile } from '@/utils/files'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('imageFile') as File

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

    const imageUrl = await getUploadedFile(file, 'case-studies')
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 400 }
      )
    }

    const existingCaseStudy = await prisma.caseStudy.findUnique({
      where: { id },
    })

    if (!existingCaseStudy) {
      return NextResponse.json(
        { error: 'Case study not found' },
        { status: 404 }
      )
    }

    // Add the new image URL to the existing array
    const updatedImageUrls = [...existingCaseStudy.imageUrls, imageUrl]

    const updatedCaseStudy = await prisma.caseStudy.update({
      where: { id },
      data: { imageUrls: updatedImageUrls },
    })

    return NextResponse.json({
      success: true,
      message: 'Case study image uploaded successfully',
      caseStudy: updatedCaseStudy,
      imageUrl,
    })
  } catch (error) {
    console.error('Error uploading case study image:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const imageUrl = searchParams.get('imageUrl')

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL not provided' },
        { status: 400 }
      )
    }

    const existingCaseStudy = await prisma.caseStudy.findUnique({
      where: { id },
    })

    if (!existingCaseStudy) {
      return NextResponse.json(
        { error: 'Case study not found' },
        { status: 404 }
      )
    }

    // Remove the image URL from the array
    const updatedImageUrls = existingCaseStudy.imageUrls.filter(
      url => url !== imageUrl
    )

    // Delete the file from storage
    await deleteUploadedFile(imageUrl)

    const updatedCaseStudy = await prisma.caseStudy.update({
      where: { id },
      data: { imageUrls: updatedImageUrls },
    })

    return NextResponse.json({
      success: true,
      message: 'Case study image removed successfully',
      caseStudy: updatedCaseStudy,
    })
  } catch (error) {
    console.error('Error removing case study image:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
