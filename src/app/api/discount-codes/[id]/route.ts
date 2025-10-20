import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await req.json()
    const updated = await prisma.discountCode.update({
      where: { id },
      data: {
        code: body.code,
        type: body.type,
        value: body.value,
        currency: body.currency,
        isActive: body.isActive,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        usageLimit: body.usageLimit,
        firstTimeOnly: body.firstTimeOnly,
        minOrderAmount: body.minOrderAmount,
        applicableContentTypes: body.applicableContentTypes,
      },
    })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json(
      { error: 'Failed to update discount code' },
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
    await prisma.discountCode.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete discount code' },
      { status: 500 }
    )
  }
}
