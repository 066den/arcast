import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { validateFile } from '@/lib/validate'
import { deleteUploadedFile, getUploadedFile } from '@/utils/files'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

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

    console.log('Finding case study with id:', id)
    const existingCaseStudy = await prisma.caseStudy.findUnique({
      where: { id },
    })

    if (!existingCaseStudy) {
      console.error('Case study not found:', id)
      return NextResponse.json(
        { error: 'Case study not found' },
        { status: 404 }
      )
    }

    // Delete ALL old images before uploading new one
    if (existingCaseStudy.imageUrls && existingCaseStudy.imageUrls.length > 0) {
      console.log('Deleting old images:', existingCaseStudy.imageUrls)
      for (const oldImageUrl of existingCaseStudy.imageUrls) {
        try {
          await deleteUploadedFile(oldImageUrl)
        } catch (error) {
          console.warn('Failed to delete old image:', oldImageUrl, error)
          // Ignore deletion errors
        }
      }
    }

    // Upload to S3
    console.log('Uploading file to S3:', file.name, file.size, 'bytes')
    const imageUrl = await getUploadedFile(file, 'case-studies')
    console.log('File uploaded successfully, URL:', imageUrl)

    // Replace all images with only the new one (only one image allowed)
    const updatedImageUrls = [imageUrl]

    console.log('Updating case study with image URLs:', updatedImageUrls)
    const updatedCaseStudy = await prisma.caseStudy.update({
      where: { id },
      data: { imageUrls: updatedImageUrls },
    })
    console.log('Case study updated successfully')

    return NextResponse.json({
      success: true,
      message: 'Case study image uploaded successfully',
      caseStudy: updatedCaseStudy,
      imageUrl,
    })
  } catch (error) {
    console.error('Error uploading case study image:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
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

    // Delete the file from S3 or local storage
    try {
      await deleteUploadedFile(imageUrl)
    } catch {}

    // Clear the image array (only one image at index 0)
    const updatedImageUrls: string[] = []

    const updatedCaseStudy = await prisma.caseStudy.update({
      where: { id },
      data: { imageUrls: updatedImageUrls },
    })

    return NextResponse.json({
      success: true,
      message: 'Case study image removed successfully',
      caseStudy: updatedCaseStudy,
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
