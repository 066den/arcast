'use client'

import BookingsTable from '@/components/admin/BookingsTable'

export default function AdminPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Bookings</h1>
      <BookingsTable initialData={[]} />
    </div>
  )
}
