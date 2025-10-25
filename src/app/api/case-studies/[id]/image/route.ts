import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { validateFile } from '@/lib/validate'
import { deleteUploadedFile } from '@/utils/files'

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

    // Upload to S3 (lazy import to avoid build-time evaluation in build step)
    const s3 = await import('@/lib/s3')

    const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const uniqueFileName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${fileExt}`

    const uploadRes = await s3.uploadToS3(file, uniqueFileName, {
      folder: 'case-studies',
      contentType: file.type,
      metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        entity: 'case-study',
        entityId: id,
      },
    })

    const imageUrl = uploadRes.cdnUrl || uploadRes.url

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
      (url: any) => url !== imageUrl
    )

    // Delete the file from storage (S3 if applicable, fallback to local deletion)
    try {
      const { isS3Url, extractFileKeyFromUrl, deleteFromS3 } = await import('@/lib/s3')
      if (isS3Url(imageUrl)) {
        const key = extractFileKeyFromUrl(imageUrl)
        if (key) {
          await deleteFromS3(key)
        }
      } else {
        await deleteUploadedFile(imageUrl)
      }
    } catch {}

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
