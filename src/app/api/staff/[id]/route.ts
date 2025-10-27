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
    console.error('Error fetching staff:', error)
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
        } catch (error) {
          console.error('Error deleting old image:', error)
        }
      }

      // Upload new image to local storage (consistent with POST)
      try {
        console.log('About to upload image:', {
          fileName: imageFile.name,
          fileSize: imageFile.size,
          fileType: imageFile.type,
        })
        imageUrl = await getUploadedFile(imageFile, 'staff')
        console.log('Image uploaded successfully:', imageUrl)
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError)
        console.error(
          'Upload error stack:',
          uploadError instanceof Error ? uploadError.stack : 'No stack trace'
        )
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

    console.log('Updating staff in database...')
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

    console.log('Staff updated successfully:', staff.name)
    return NextResponse.json(staff)
  } catch (error) {
    console.error('Error updating staff:', error)
    console.error(
      'Error stack:',
      error instanceof Error ? error.stack : 'No stack'
    )
    console.error('Full error object:', JSON.stringify(error, null, 2))
    return NextResponse.json(
      {
        error: 'Failed to update staff',
        details: error instanceof Error ? error.message : 'Unknown error',
        type: error?.constructor?.name || 'Unknown',
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
    console.error('Error deleting staff:', error)
    return NextResponse.json(
      { error: 'Failed to delete staff' },
      { status: 500 }
    )
  }
}
