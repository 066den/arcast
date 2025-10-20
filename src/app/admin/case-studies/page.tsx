import { Suspense } from 'react'
import { Preloader } from '@/components/ui/preloader'
import CaseStudiesTable from '@/components/admin/CaseStudiesTable'
import { prisma } from '@/lib/prisma'

async function fetchCaseStudies() {
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

export default async function CaseStudiesPage() {
  const caseStudies = await fetchCaseStudies()

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Case Studies Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your case studies, showcase client success stories and project
          details
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <Preloader
              variant="spinner"
              size="xl"
              text="Loading case studies..."
            />
          </div>
        }
      >
        <CaseStudiesTable initialData={caseStudies} />
      </Suspense>
    </div>
  )
}
