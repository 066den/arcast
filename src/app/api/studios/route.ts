import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getStudios } from '@/services/studioServices'
import { validateStudio } from '@/lib/schemas'
import { ERROR_MESSAGES } from '@/lib/constants'
import { getUploadedFile } from '@/utils/files'
import { validateFile } from '@/lib/validate'

export async function GET() {
  try {
    const studiosWithAvailability = await getStudios()
    return NextResponse.json(studiosWithAvailability)
  } catch (error) {
    console.error('Error fetching studios:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  const formData = await req.formData()
  const data = Object.fromEntries(formData)

  try {
    const validation = validateStudio({
      ...data,
      totalSeats: parseInt(data.totalSeats as string),
    })
    if (!validation.success) {
      return NextResponse.json(
        {
          error: ERROR_MESSAGES.INVALID_REQUEST,
          details: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const { name, location, totalSeats, openingTime, closingTime, imageFile } =
      data

    let imageUrl = null

    if (imageFile) {
      if (!(imageFile instanceof File)) {
        return NextResponse.json(
          { error: 'Invalid image file provided' },
          { status: 400 }
        )
      }

      const validation = validateFile(imageFile)

      if (validation) {
        return NextResponse.json({ error: validation }, { status: 400 })
      }

      const uploadedUrl = await getUploadedFile(imageFile, 'studios')
      if (!uploadedUrl) {
        return NextResponse.json(
          { error: 'Failed to upload image' },
          { status: 400 }
        )
      }
      imageUrl = uploadedUrl
    }

    const newStudio = await prisma.studio.create({
      data: {
        name: name as string,
        location: location as string,
        totalSeats: parseInt(totalSeats as string),
        imageUrl,
        openingTime: openingTime as string,
        closingTime: closingTime as string,
      },
    })

    return NextResponse.json(newStudio)
  } catch (error) {
    console.error('Error creating studio:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: 500 }
    )
  }
}
