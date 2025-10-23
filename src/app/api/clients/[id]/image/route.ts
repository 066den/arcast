import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateFile } from '@/lib/validate'
import { deleteUploadedFile, getUploadedFile } from '@/utils/files'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const formData = await req.formData()
    const file = formData.get('imageFile') as File | null
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const validation = validateFile(file)
    if (validation)
      return NextResponse.json({ error: validation }, { status: 400 })

    const imageUrl = await getUploadedFile(file, 'clients')

    const existing = await prisma.client.findUnique({ where: { id } })
    if (!existing)
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })

    if (existing.imageUrl) {
      try {
        await deleteUploadedFile(existing.imageUrl)
      } catch {}
    }

    const updated = await prisma.client.update({
      where: { id },
      data: { imageUrl },
    })
    return NextResponse.json({ success: true, imageUrl: updated.imageUrl })
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const existing = await prisma.client.findUnique({ where: { id } })
    if (!existing)
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    if (existing.imageUrl) {
      try {
        await deleteUploadedFile(existing.imageUrl)
      } catch {}
    }
    await prisma.client.update({ where: { id }, data: { imageUrl: null } })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    )
  }
}
