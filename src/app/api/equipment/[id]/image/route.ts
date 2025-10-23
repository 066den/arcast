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

    const imageUrl = await getUploadedFile(file, 'equipment')
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 400 }
      )
    }

    const existingEquipment = await prisma.equipment.findUnique({
      where: { id },
    })

    if (!existingEquipment) {
      return NextResponse.json(
        { error: 'Equipment not found' },
        { status: 404 }
      )
    }

    if (existingEquipment.imageUrl) {
      await deleteUploadedFile(existingEquipment.imageUrl)
    }

    const updatedEquipment = await prisma.equipment.update({
      where: { id },
      data: { imageUrl },
    })

    return NextResponse.json({
      success: true,
      message: 'Equipment image updated successfully',
      equipment: updatedEquipment,
    })
  } catch (error) {
    console.error('Error updating equipment image:', error)
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

    const existingEquipment = await prisma.equipment.findUnique({
      where: { id },
    })

    if (!existingEquipment) {
      return NextResponse.json(
        { error: 'Equipment not found' },
        { status: 404 }
      )
    }

    if (existingEquipment.imageUrl) {
      await deleteUploadedFile(existingEquipment.imageUrl)
    }

    const updatedEquipment = await prisma.equipment.update({
      where: { id },
      data: { imageUrl: null },
    })

    return NextResponse.json({
      success: true,
      message: 'Equipment image removed successfully',
      equipment: updatedEquipment,
    })
  } catch (error) {
    console.error('Error removing equipment image:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
