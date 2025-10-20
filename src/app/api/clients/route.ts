import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const clients = await prisma.client.findMany({ orderBy: { name: 'asc' } })
    return NextResponse.json(clients)
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const created = await prisma.client.create({
      data: {
        name: body.name ?? null,
        jobTitle: body.jobTitle ?? null,
        showTitle: body.showTitle ?? null,
        testimonial: body.testimonial ?? null,
        featured: Boolean(body.featured) ?? false,
        imageUrl: body.imageUrl ?? null,
      },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    )
  }
}
