import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const blog = await prisma.blogRecord.findUnique({
    where: { id },
  })
  return NextResponse.json(blog)
}
