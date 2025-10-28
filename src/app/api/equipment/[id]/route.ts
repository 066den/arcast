import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { deleteUploadedFile, getUploadedFile } from '@/utils/files'
import { validateFile } from '@/lib/validate'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const equipment = await prisma.equipment.findUnique({
      where: {
        id,
      },
    })

    if (!equipment) {
      return NextResponse.json(
        { error: 'Equipment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(equipment)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch equipment' },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const nameRaw = formData.get('name')
    const descriptionRaw = formData.get('description')
    const imageFile = formData.get('imageFile') as File

    // Convert empty strings to null for nullable fields
    const name =
      typeof nameRaw === 'string' && nameRaw.trim() ? nameRaw.trim() : null
    const description =
      typeof descriptionRaw === 'string' && descriptionRaw.trim()
        ? descriptionRaw.trim()
        : null

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Get existing equipment to check current image
    const existingEquipment = await prisma.equipment.findUnique({
      where: { id },
    })

    if (!existingEquipment) {
      return NextResponse.json(
        { error: 'Equipment not found' },
        { status: 404 }
      )
    }

    let imageUrl = existingEquipment.imageUrl

    // Handle new image upload
    if (imageFile && imageFile.size > 0) {
      const validation = validateFile(imageFile)
      if (validation) {
        return NextResponse.json({ error: validation }, { status: 400 })
      }

      // Delete old image if it exists
      if (existingEquipment.imageUrl) {
        try {
          await deleteUploadedFile(existingEquipment.imageUrl)
        } catch (error) {}
      }

      // Upload new image to local storage (consistent with POST)
      imageUrl = await getUploadedFile(imageFile, 'equipment')
    }

    const equipment = await prisma.equipment.update({
      where: {
        id,
      },
      data: {
        name,
        description,
        imageUrl,
      },
    })

    return NextResponse.json(equipment)
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to update equipment',
        details: error instanceof Error ? error.message : String(error),
      },
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

    await prisma.equipment.delete({
      where: {
        id,
      },
    })

    return NextResponse.json({ message: 'Equipment deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete equipment' },
      { status: 500 }
    )
  }
}
