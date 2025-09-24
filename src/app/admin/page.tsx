'use client'

import BookingsTable from '@/components/admin/BookingsTable'
import { redirect } from 'next/navigation'

export default function AdminPage() {
  //TODO: Remove this after development
  redirect('/')
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Bookings</h1>
      <BookingsTable initialData={[]} />
    </div>
  )
}
