import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const { featured, name, jobTitle, showTitle, testimonial, imageUrl } =
      body as {
        featured?: boolean
        name?: string | null
        jobTitle?: string | null
        showTitle?: string | null
        testimonial?: string | null
        imageUrl?: string | null
      }
    const updated = await prisma.client.update({
      where: { id },
      data: { featured, name, jobTitle, showTitle, testimonial, imageUrl },
    })
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await prisma.client.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    )
  }
}
