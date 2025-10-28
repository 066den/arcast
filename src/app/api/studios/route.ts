import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getStudios } from '@/services/studioServices'
import { validateStudio } from '@/lib/schemas'
import { ERROR_MESSAGES } from '@/lib/constants'
import { validateFile } from '@/lib/validate'
import { getUploadedFile } from '@/utils/files'

export async function GET() {
  try {
    const studiosWithAvailability = await getStudios()
    return NextResponse.json(studiosWithAvailability)
  } catch (error) {
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
    const totalSeatsNum = parseInt(data.totalSeats as string, 10)

    if (isNaN(totalSeatsNum) || totalSeatsNum <= 0) {
      return NextResponse.json(
        { error: 'totalSeats must be a positive number' },
        { status: 400 }
      )
    }

    const validation = validateStudio({
      name: data.name as string,
      location: data.location as string,
      openingTime: data.openingTime as string,
      closingTime: data.closingTime as string,
      totalSeats: totalSeatsNum,
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

    const { name, location, openingTime, closingTime, imageFile } = data

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
        totalSeats: totalSeatsNum,
        imageUrl,
        openingTime: openingTime as string,
        closingTime: closingTime as string,
      },
    })

    return NextResponse.json(newStudio)
  } catch (error) {
    return NextResponse.json(
      {
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
