import { getStudios } from '@/services/studioServices'
import StudioList from '@/components/admin/studio/StudioList'

export default async function StudiosPage() {
  const studios = await getStudios()

  return (
    <div className="p-4 flex-1">
      <StudioList initialStudios={studios} />
    </div>
  )
}
