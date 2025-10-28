import { ERROR_MESSAGES } from '@/lib/constants'
import { prisma } from '@/lib/prisma'

export async function fetchPackagesAdmin() {
  if (!prisma) {
    throw new Error(ERROR_MESSAGES.PRISMA.NOT_INITIALIZED)
  }

  try {
    const packages = await prisma.package.findMany({
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
        createdAt: 'desc',
      },
    })

    return packages
  } catch (error) {
    
    if (error instanceof Error) {
      throw new Error(`Failed to fetch packages: ${error.message}`)
    }
    throw new Error('Failed to fetch packages')
  }
}
