import { prisma } from '@/lib/prisma'

export async function fetchServices() {
  try {
    const services = await prisma.service.findMany({
      include: {
        serviceType: true,
      },
      orderBy: [
        {
          serviceType: {
            sortOrder: 'asc',
          },
        },
        {
          sortOrder: 'asc',
        },
        {
          name: 'asc',
        },
      ],
    })

    // Convert Decimal objects to numbers for client components
    return services.map(service => ({
      ...service,
      price: Number(service.price),
    }))
  } catch (error) {
    
    return []
  }
}
