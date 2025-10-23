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

    const imageUrl = await getUploadedFile(file, 'staff')
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 400 }
      )
    }

    const existingStaff = await prisma.staff.findUnique({
      where: { id },
    })

    if (!existingStaff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 })
    }

    if (existingStaff.imageUrl) {
      await deleteUploadedFile(existingStaff.imageUrl)
    }

    const updatedStaff = await prisma.staff.update({
      where: { id },
      data: { imageUrl },
    })

    return NextResponse.json({
      success: true,
      message: 'Staff image updated successfully',
      staff: updatedStaff,
    })
  } catch (error) {
    console.error('Error updating staff image:', error)
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

    const existingStaff = await prisma.staff.findUnique({
      where: { id },
    })

    if (!existingStaff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 })
    }

    if (existingStaff.imageUrl) {
      await deleteUploadedFile(existingStaff.imageUrl)
    }

    const updatedStaff = await prisma.staff.update({
      where: { id },
      data: { imageUrl: null },
    })

    return NextResponse.json({
      success: true,
      message: 'Staff image removed successfully',
      staff: updatedStaff,
    })
  } catch (error) {
    console.error('Error removing staff image:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
