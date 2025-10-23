import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { validateFile } from '@/lib/validate'
import { deleteUploadedFile, getUploadedFile } from '@/utils/files'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
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

    const imageUrl = await getUploadedFile(file, 'samples')
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 400 }
      )
    }

    const updatedSample = await prisma.sample.update({
      where: { id },
      data: {
        thumbUrl: imageUrl,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Sample image uploaded successfully',
      imageUrl: imageUrl,
      sample: updatedSample,
    })
  } catch (error) {
    console.error('Error uploading sample image:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sample = await prisma.sample.findUnique({
      where: { id },
    })

    if (!sample) {
      return NextResponse.json({ error: 'Sample not found' }, { status: 404 })
    }

    if (sample.thumbUrl) {
      await deleteUploadedFile(sample.thumbUrl)
    }

    const updatedSample = await prisma.sample.update({
      where: { id },
      data: {
        thumbUrl: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Sample image removed successfully',
      sample: updatedSample,
    })
  } catch (error) {
    console.error('Error removing sample image:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
