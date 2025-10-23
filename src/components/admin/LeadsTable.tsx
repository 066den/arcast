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
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Calendar, Mail, Phone, Search, User } from 'lucide-react'

interface Lead {
  id: string
  fullName: string
  email: string | null
  phoneNumber: string | null
  whatsappNumber: string | null
  recordingLocation: string | null
  createdAt: Date
  updatedAt: Date
  bookings: Array<{
    id: string
    startTime: Date
    endTime: Date
    status: string
    studio: { name: string } | null
    service: { name: string } | null
    contentPackage: { name: string } | null
  }>
  orders: Array<{
    id: string
    serviceName: string
    status: string
    createdAt: Date
  }>
}

interface Props {
  initialData: Lead[]
}

export default function LeadsTable({ initialData }: Props) {
  const [leads, setLeads] = useState(initialData)
  const [search, setSearch] = useState('')

  const filtered = useMemo(
    () =>
      leads.filter(lead => {
        const s = search.toLowerCase()
        const matches =
          lead.fullName.toLowerCase().includes(s) ||
          (lead.email || '').toLowerCase().includes(s) ||
          (lead.phoneNumber || '').toLowerCase().includes(s) ||
          (lead.whatsappNumber || '').toLowerCase().includes(s) ||
          (lead.recordingLocation || '').toLowerCase().includes(s)
        return matches
      }),
    [leads, search]
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

  const getBookingStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'secondary'
      case 'CONFIRMED':
        return 'default'
      case 'COMPLETED':
        return 'default'
      case 'CANCELLED':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'secondary'
      case 'CONFIRMED':
      case 'IN_PROGRESS':
        return 'default'
      case 'COMPLETED':
        return 'default'
      case 'CANCELLED':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search leads..."
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
              <TableHead>Contact Info</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(lead => (
              <TableRow key={lead.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{lead.fullName}</div>
                      {lead.recordingLocation && (
                        <div className="text-sm text-muted-foreground">
                          {lead.recordingLocation}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {lead.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span>{lead.email}</span>
                      </div>
                    )}
                    {lead.phoneNumber && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{lead.phoneNumber}</span>
                      </div>
                    )}
                    {lead.whatsappNumber && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>WhatsApp: {lead.whatsappNumber}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {lead.bookings.length > 0 ? (
                      lead.bookings.slice(0, 2).map(booking => (
                        <div key={booking.id} className="text-sm">
                          <div className="font-medium">
                            {booking.studio?.name ||
                              booking.service?.name ||
                              booking.contentPackage?.name}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={getBookingStatusBadge(booking.status)}
                            >
                              {booking.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(booking.startTime)}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No bookings
                      </span>
                    )}
                    {lead.bookings.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{lead.bookings.length - 2} more
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {lead.orders.length > 0 ? (
                      lead.orders.slice(0, 2).map(order => (
                        <div key={order.id} className="text-sm">
                          <div className="font-medium">{order.serviceName}</div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getOrderStatusBadge(order.status)}>
                              {order.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(order.createdAt)}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No orders
                      </span>
                    )}
                    {lead.orders.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{lead.orders.length - 2} more
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(lead.createdAt)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No leads found matching your search.
        </div>
      )}
    </div>
  )
}
