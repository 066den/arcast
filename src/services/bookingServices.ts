import { prisma } from '@/lib/prisma'

export const getAdditionalServices = async () => {
  if (!prisma) {
    throw new Error('Prisma client is not initialized')
  }

  try {
    const additionalServices = await prisma.additionalService.findMany({
      orderBy: {
        order: 'asc',
      },
    })
    return additionalServices.map(service => ({
      ...service,
      price: Number(service.price),
    }))
  } catch (error) {
    console.error('Error fetching additional services:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to fetch additional services: ${error.message}`)
    }
    throw new Error('Failed to fetch additional services')
  }
}
