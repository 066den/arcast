import { Suspense } from 'react'
import { Preloader } from '@/components/ui/preloader'
import CaseStudyEditForm from '@/components/admin/CaseStudyEditForm'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

async function fetchCaseStudy(id: string) {
  try {
    const caseStudy = await prisma.caseStudy.findUnique({
      where: { id },
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
    })

    return caseStudy
  } catch (error) {
    console.error('Error fetching case study:', error)
    return null
  }
}

async function fetchRelatedData() {
  try {
    const [clients, staff, equipment] = await Promise.all([
      prisma.client.findMany({
        select: {
          id: true,
          name: true,
          showTitle: true,
          jobTitle: true,
        },
        orderBy: {
          name: 'asc',
        },
      }),
      prisma.staff.findMany({
        select: {
          id: true,
          name: true,
          role: true,
        },
        orderBy: {
          name: 'asc',
        },
      }),
      prisma.equipment.findMany({
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: 'asc',
        },
      }),
    ])

    return { clients, staff, equipment }
  } catch (error) {
    console.error('Error fetching related data:', error)
    return { clients: [], staff: [], equipment: [] }
  }
}

interface EditCaseStudyPageProps {
  params: {
    id: string
  }
}

export default async function EditCaseStudyPage({
  params,
}: EditCaseStudyPageProps) {
  const { id } = params

  const [caseStudy, relatedData] = await Promise.all([
    fetchCaseStudy(id),
    fetchRelatedData(),
  ])

  if (!caseStudy) {
    notFound()
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Case Study</h1>
        <p className="text-muted-foreground mt-2">
          Update case study details, content, and associations
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <Preloader
              variant="spinner"
              size="xl"
              text="Loading case study..."
            />
          </div>
        }
      >
        <CaseStudyEditForm
          caseStudy={caseStudy}
          clients={relatedData.clients}
          staff={relatedData.staff}
          equipment={relatedData.equipment}
        />
      </Suspense>
    </div>
  )
}
