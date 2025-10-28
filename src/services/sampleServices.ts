import { prisma } from '@/lib/prisma'

export async function fetchSamples() {
  try {
    const samples = await prisma.sample.findMany({
      include: {
        serviceType: true,
      },
      orderBy: {
        id: 'desc',
      },
    })
    return samples
  } catch (error) {
    
    return []
  }
}
