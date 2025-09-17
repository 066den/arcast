import BookingsTable from '@/components/admin/BookingsTable'

export default async function AdminPage() {
  return (
    <div className="p-4">
      <BookingsTable initialData={[]} />
    </div>
  )
}
