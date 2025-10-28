import { prisma } from '@/lib/prisma'

export async function fetchStaff() {
  try {
    const staff = await prisma.staff.findMany({
      orderBy: {
        name: 'asc',
      },
    })
    return staff
  } catch (error) {
    
    return []
  }
}
