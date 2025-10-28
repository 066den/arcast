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
  try {
    const { id } = await params

    const staff = await prisma.staff.findUnique({
      where: {
        id,
      },
    })

    if (!staff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 })
    }

    return NextResponse.json(staff)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
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
    const name = formData.get('name') as string
    const role = formData.get('role') as string
    const imageFile = formData.get('imageFile') as File

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Get existing staff to check current image
    const existingStaff = await prisma.staff.findUnique({
      where: { id },
    })

    if (!existingStaff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 })
    }

    let imageUrl = existingStaff.imageUrl

    // Handle new image upload
    if (imageFile && imageFile.size > 0) {
      const validation = validateFile(imageFile)
      if (validation) {
        return NextResponse.json({ error: validation }, { status: 400 })
      }

      // Delete old image if it exists
      if (existingStaff.imageUrl) {
        try {
          await deleteUploadedFile(existingStaff.imageUrl)
        } catch (error) {}
      }

      // Upload new image to local storage (consistent with POST)
      try {
        imageUrl = await getUploadedFile(imageFile, 'staff')
      } catch (uploadError) {
        return NextResponse.json(
          {
            error: 'Failed to upload image',
            details:
              uploadError instanceof Error
                ? uploadError.message
                : 'Unknown error',
          },
          { status: 500 }
        )
      }
    }

    const staff = await prisma.staff.update({
      where: {
        id,
      },
      data: {
        name,
        role,
        imageUrl,
      },
    })

    return NextResponse.json(staff)
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to update staff',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.staff.delete({
      where: {
        id,
      },
    })

    return NextResponse.json({ message: 'Staff deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete staff' },
      { status: 500 }
    )
  }
}
