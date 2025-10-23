import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const codes = await prisma.discountCode.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(codes)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch discount codes' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const code = await prisma.discountCode.create({
      data: {
        code: body.code,
        type: body.type,
        value: body.value,
        currency: body.currency ?? 'AED',
        isActive: body.isActive ?? true,
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        endDate: new Date(body.endDate),
        usageLimit: body.usageLimit ?? null,
        firstTimeOnly: body.firstTimeOnly ?? false,
        minOrderAmount: body.minOrderAmount ?? null,
        applicableContentTypes: body.applicableContentTypes ?? [],
      },
    })
    return NextResponse.json(code, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Failed to create discount code' },
      { status: 500 }
    )
  }
}
