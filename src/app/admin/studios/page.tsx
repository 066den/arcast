'use client'

import StudioList from '@/components/admin/studio/StudioList'

export default function StudiosPage() {
  return (
    <div className="p-4 flex-1">
      <h1 className="text-2xl font-bold mb-4">Studios</h1>
      <StudioList initialStudios={[]} />
    </div>
  )
}
