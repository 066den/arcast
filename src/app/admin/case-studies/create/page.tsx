import { Suspense } from 'react'
import { Preloader } from '@/components/ui/preloader'
import CreateCaseStudyForm from '@/components/admin/CreateCaseStudyForm'
import { prisma } from '@/lib/prisma'

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

    // Filter out any items with null, undefined, or empty IDs
    const filteredClients = clients.filter(
      client => client.id && typeof client.id === 'string' && client.id.trim() !== ''
    )
    const filteredStaff = staff.filter(
      s => s.id && typeof s.id === 'string' && s.id.trim() !== ''
    )
    const filteredEquipment = equipment.filter(
      e => e.id && typeof e.id === 'string' && e.id.trim() !== ''
    )

    return {
      clients: filteredClients,
      staff: filteredStaff,
      equipment: filteredEquipment,
    }
  } catch (error) {
    return { clients: [], staff: [], equipment: [] }
  }
}

export default async function CreateCaseStudyPage() {
  const relatedData = await fetchRelatedData()

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create Case Study</h1>
        <p className="text-muted-foreground mt-2">
          Create a new case study to showcase client success stories and project
          details
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <Preloader
              variant="spinner"
              size="xl"
              text="Loading form..."
            />
          </div>
        }
      >
        <CreateCaseStudyForm
          clients={relatedData.clients}
          staff={relatedData.staff}
          equipment={relatedData.equipment}
        />
      </Suspense>
    </div>
  )
}

