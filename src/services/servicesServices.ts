import { ERROR_MESSAGES } from '@/lib/constants'
import { prisma } from '@/lib/prisma'

export const getServices = async () => {
  if (!prisma) {
    throw new Error(ERROR_MESSAGES.PRISMA.NOT_INITIALIZED)
  }

  try {
    const services = await prisma.service.findMany({
      orderBy: {
        createdAt: 'asc',
      },
      where: {
        isActive: true,
      },
    })

    const processedServices = services.map(service => ({
      ...service,
      price: service.price ? Number(service.price) : undefined,
      description: service.description
        ? service.description.replace(/\\n/g, '\n')
        : service.description,
    }))

    return processedServices
  } catch (error) {
    console.error('Error fetching services:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to fetch services: ${error.message}`)
    }
    throw new Error('Failed to fetch services')
  }
}

export const getServicesByType = async (serviceTypeId: string) => {
  if (!prisma) {
    throw new Error(ERROR_MESSAGES.PRISMA.NOT_INITIALIZED)
  }
  try {
    const services = await prisma.service.findMany({
      where: {
        serviceTypeId: serviceTypeId,
        isActive: true,
      },
    })
    return services
  } catch (error) {
    console.error('Error fetching services by type:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to fetch services by type: ${error.message}`)
    }
    throw new Error('Failed to fetch services by type')
  }
}

export const getServiceTypes = async () => {
  if (!prisma) {
    throw new Error(ERROR_MESSAGES.PRISMA.NOT_INITIALIZED)
  }
  try {
    // Fetch all active service types, including only their active services
    const servicesTypes = await prisma.serviceType.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        services: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            price: true,
            currency: true,
          },
        },
      },
    })
    return servicesTypes
  } catch (error) {
    console.error('Error fetching services types:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to fetch services types: ${error.message}`)
    }
    throw new Error('Failed to fetch services types')
  }
}
