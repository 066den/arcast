import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  try {
    // Check if user is authenticated
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const callRequests = await prisma.callRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    })

    return NextResponse.json({ callRequests })
  } catch (error) {
    
    return NextResponse.json(
      { error: 'Failed to fetch call requests' },
      { status: 500 }
    )
  }
}
