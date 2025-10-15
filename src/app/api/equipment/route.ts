import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { getUploadedFile } from '@/utils/files'
import { validateFile } from '@/lib/validate'

export async function GET() {
  try {
    const equipment = await prisma.equipment.findMany({
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(equipment)
  } catch (error) {
    console.error('Error fetching equipment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch equipment' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const imageFile = formData.get('imageFile') as File

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    let imageUrl = null

    if (imageFile && imageFile.size > 0) {
      const validation = validateFile(imageFile)
      if (validation) {
        return NextResponse.json({ error: validation }, { status: 400 })
      }

      const uploadedUrl = await getUploadedFile(imageFile, 'equipment')
      if (!uploadedUrl) {
        return NextResponse.json(
          { error: 'Failed to upload image' },
          { status: 400 }
        )
      }
      imageUrl = uploadedUrl
    }

    const equipment = await prisma.equipment.create({
      data: {
        name,
        description,
        imageUrl,
      },
    })

    return NextResponse.json(equipment, { status: 201 })
  } catch (error) {
    console.error('Error creating equipment:', error)
    return NextResponse.json(
      { error: 'Failed to create equipment' },
      { status: 500 }
    )
  }
}
