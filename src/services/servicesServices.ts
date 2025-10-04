import { ERROR_MESSAGES } from '@/lib/constants'
import { prisma } from '@/lib/prisma'
import { PackageWithServices } from '@/types'

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

    const processedServices = services.map(service => ({
      ...service,
      price: service.price ? Number(service.price) : 0,
    }))

    return processedServices
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
    const servicesTypes = await prisma.serviceType.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
      include: {
        services: {
          where: {
            isActive: true,
          },
          include: {
            serviceType: {
              select: {
                slug: true,
              },
            },
          },
        },
      },
    })

    const processedServiceTypes = servicesTypes.map(serviceType => ({
      ...serviceType,
      services: serviceType.services.map(service => ({
        ...service,
        price: service.price ? Number(service.price) : 0,
        type: service.serviceType.slug,
      })),
    }))

    return processedServiceTypes
  } catch (error) {
    console.error('Error fetching services types:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to fetch services types: ${error.message}`)
    }
    throw new Error('Failed to fetch services types')
  }
}

export const getPackages = async (): Promise<PackageWithServices[]> => {
  if (!prisma) {
    throw new Error(ERROR_MESSAGES.PRISMA.NOT_INITIALIZED)
  }
  try {
    const packages = await prisma.package.findMany({
      where: {
        isActive: true,
      },
      include: {
        servicePackageRecords: {
          include: {
            includedService: true,
          },
        },
        addServicePackageRecords: {
          include: {
            includedAdditionalService: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    const processedPackages = packages.map(pkg => ({
      ...pkg,
      basePrice: pkg.basePrice ? Number(pkg.basePrice) : 0,
      services: pkg.servicePackageRecords.map(record => ({
        id: record.includedService.id,
        name: record.includedService.name,
        description: record.includedService.description || '',
        price: record.includedService.price
          ? Number(record.includedService.price)
          : 0,
        quantity: record.serviceQuantity,
      })),
      additionalServices: pkg.addServicePackageRecords.map(record => ({
        ...record.includedAdditionalService,
        price: record.includedAdditionalService.price
          ? Number(record.includedAdditionalService.price)
          : 0,
        quantity: record.serviceQuantity,
      })),
      // Remove the raw records as we've processed them
      servicePackageRecords: undefined,
      addServicePackageRecords: undefined,
    }))

    return processedPackages
  } catch (error) {
    console.error('Error fetching packages:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to fetch packages: ${error.message}`)
    }
    throw new Error('Failed to fetch packages')
  }
}

export const getAdditionalServices = async () => {
  if (!prisma) {
    throw new Error(ERROR_MESSAGES.PRISMA.NOT_INITIALIZED)
  }
  try {
    const additionalServices = await prisma.additionalService.findMany({
      where: {
        isActive: true,
      },
    })

    return additionalServices.map(service => ({
      ...service,
      price: service.price ? Number(service.price) : 0,
    }))
  } catch (error) {
    console.error('Error fetching additional services:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to fetch additional services: ${error.message}`)
    }
    throw new Error('Failed to fetch additional services')
  }
}
