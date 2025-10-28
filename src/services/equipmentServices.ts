import { prisma } from '@/lib/prisma'

export async function fetchEquipment() {
  try {
    const equipment = await prisma.equipment.findMany({
      orderBy: {
        name: 'asc',
      },
    })
    return equipment
  } catch (error) {
    
    return []
  }
}
