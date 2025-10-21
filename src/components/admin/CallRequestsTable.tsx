'use client'

import { useMemo, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { Input } from '../ui/input'
import { Calendar, Phone, Search, User } from 'lucide-react'

interface CallRequest {
  id: string
  firstName: string
  lastName: string | null
  phone: string
  callDateTime: Date
  createdAt: Date
  updatedAt: Date
}

interface Props {
  initialData: CallRequest[]
}

export default function CallRequestsTable({ initialData }: Props) {
  const [callRequests, setCallRequests] = useState(initialData)
  const [search, setSearch] = useState('')

  const filtered = useMemo(
    () =>
      callRequests.filter(request => {
        const s = search.toLowerCase()
        const fullName =
          `${request.firstName} ${request.lastName || ''}`.toLowerCase()
        const matches =
          fullName.includes(s) || request.phone.toLowerCase().includes(s)
        return matches
      }),
    [callRequests, search]
  )

  const formatDate = (d: string | Date | null | undefined) =>
    d
      ? new Date(d).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—'

  const formatCallDateTime = (d: string | Date | null | undefined) =>
    d
      ? new Date(d).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—'

  const isUpcoming = (callDateTime: Date) => {
    return new Date(callDateTime) > new Date()
  }

  const isPast = (callDateTime: Date) => {
    return new Date(callDateTime) < new Date()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search call requests..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Scheduled Call Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(request => (
              <TableRow key={request.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {request.firstName} {request.lastName || ''}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span>{request.phone}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span>{formatCallDateTime(request.callDateTime)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {isUpcoming(request.callDateTime) ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Upcoming
                      </span>
                    ) : isPast(request.callDateTime) ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Past
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Now
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(request.createdAt)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No call requests found matching your search.
        </div>
      )}
    </div>
  )
}
