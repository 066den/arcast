import { prisma } from '@/lib/prisma'

export async function fetchCaseStudies() {
  try {
    const caseStudies = await prisma.caseStudy.findMany({
      include: {
        client: true,
        staff: true,
        equipment: true,
        caseContent: {
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    })

    return caseStudies
  } catch (error) {
    console.error('Error fetching case studies:', error)
    return []
  }
}
