import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateFile } from '@/lib/validate'
import { deleteUploadedFile } from '@/utils/files'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

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

    // Lazy-load S3 helpers at runtime
    const s3 = await import('@/lib/s3')

    const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const uniqueFileName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${fileExt}`

    const uploadRes = await s3.uploadToS3(file, uniqueFileName, {
      folder: 'clients',
      contentType: file.type,
      metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        entity: 'client',
        entityId: id,
      },
    })
    const imageUrl = uploadRes.cdnUrl || uploadRes.url

    const existing = await prisma.client.findUnique({ where: { id } })
    if (!existing)
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })

    if (existing.imageUrl) {
      try {
        const oldUrl = existing.imageUrl
        const { isS3Url, extractFileKeyFromUrl, deleteFromS3 } = await import('@/lib/s3')
        if (isS3Url(oldUrl)) {
          const key = extractFileKeyFromUrl(oldUrl)
          if (key) await deleteFromS3(key)
        } else {
          await deleteUploadedFile(oldUrl)
        }
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
        const oldUrl = existing.imageUrl
        const { isS3Url, extractFileKeyFromUrl, deleteFromS3 } = await import('@/lib/s3')
        if (isS3Url(oldUrl)) {
          const key = extractFileKeyFromUrl(oldUrl)
          if (key) await deleteFromS3(key)
        } else {
          await deleteUploadedFile(oldUrl)
        }
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
