'use client'

import { Booking } from '@/types'
import { useState } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type VisibilityState,
  type Row,
  type Cell,
  type HeaderGroup,
  type Header,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { Badge } from '../ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Input } from '../ui/input'
import {
  Calendar,
  Clock,
  User,
  MapPin,
  CreditCard,
  Search,
  Filter,
} from 'lucide-react'
import { toast } from 'sonner'
import { ApiError, updateBookingStatus } from '@/lib/api'
import { BOOKING_STATUS } from '@/lib/constants'

interface BookingsTableProps {
  initialData: Booking[]
}

const BookingsTable = ({ initialData }: BookingsTableProps) => {
  const [bookings, setBookings] = useState(initialData)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)

  const handleStatusChange = async (
    bookingId: string,
    newStatus: Booking['status']
  ) => {
    setIsLoading(true)
    try {
      await updateBookingStatus(bookingId, newStatus)
      setBookings(prev =>
        prev.map(booking =>
          booking.id === bookingId ? { ...booking, status: newStatus } : booking
        )
      )
      toast.success('Booking status updated successfully')
    } catch (error) {
      console.error('Error updating booking status:', error)
      if (error instanceof ApiError) {
        toast.error(error.message)
      } else {
        toast.error('Failed to update booking status')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case BOOKING_STATUS.PENDING:
        return 'secondary'
      case BOOKING_STATUS.CONFIRMED:
        return 'default'
      case BOOKING_STATUS.PAID:
        return 'default'
      case BOOKING_STATUS.COMPLETED:
        return 'default'
      case BOOKING_STATUS.CANCELLED:
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (typeof amount === 'number') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount)
    }
    return 'N/A'
  }

  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch =
      booking.lead?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booking.lead?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.studio?.name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' || booking.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const columns: ColumnDef<Booking>[] = [
    {
      header: 'Customer',
      accessorKey: 'lead.fullName',
      cell: ({ row }: { row: Row<Booking> }) => {
        const lead = row.original.lead
        return (
          <div className="max-w-[200px]">
            <div className="font-medium truncate">
              {lead?.fullName || 'N/A'}
            </div>
            <div className="text-sm text-muted-foreground truncate">
              {lead?.email || 'N/A'}
            </div>
            {lead?.phoneNumber && (
              <div className="text-sm text-muted-foreground">
                {lead.phoneNumber}
              </div>
            )}
          </div>
        )
      },
    },
    {
      header: 'Booking Details',
      accessorKey: 'startTime',
      cell: ({ row }: { row: Row<Booking> }) => {
        const booking = row.original
        return (
          <div className="max-w-[200px]">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {formatDateTime(booking.startTime)}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {Math.round(
                  (new Date(booking.endTime).getTime() -
                    new Date(booking.startTime).getTime()) /
                    (1000 * 60 * 60)
                )}
                h
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {booking.numberOfSeats} seat
                {booking.numberOfSeats !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      header: 'Studio & Service',
      accessorKey: 'studio.name',
      cell: ({ row }: { row: Row<Booking> }) => {
        const booking = row.original
        return (
          <div className="max-w-[200px]">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {booking.studio?.name || 'N/A'}
              </span>
            </div>
            {booking.service && (
              <div className="text-sm text-muted-foreground">
                Service: {booking.service.name}
              </div>
            )}
            {booking.contentPackage && (
              <div className="text-sm text-muted-foreground">
                Package: {booking.contentPackage.name}
              </div>
            )}
          </div>
        )
      },
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }: { row: Row<Booking> }) => {
        const booking = row.original
        return (
          <div className="min-w-[150px]">
            <Select
              value={booking.status}
              onValueChange={value =>
                handleStatusChange(booking.id, value as Booking['status'])
              }
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  <Badge variant={getStatusBadgeVariant(booking.status)}>
                    {booking.status}
                  </Badge>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.values(BOOKING_STATUS).map(status => (
                  <SelectItem key={status} value={status}>
                    <Badge variant={getStatusBadgeVariant(status)}>
                      {status}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      },
    },
    {
      header: 'Payment',
      accessorKey: 'totalCost',
      cell: ({ row }: { row: Row<Booking> }) => {
        const booking = row.original
        return (
          <div className="max-w-[150px]">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {formatCurrency(
                  (() => {
                    const v = (booking.finalAmount ??
                      booking.totalCost) as unknown
                    if (typeof v === 'number') return v
                    if (
                      v &&
                      typeof v === 'object' &&
                      typeof (v as { toString?: unknown }).toString ===
                        'function'
                    ) {
                      const s = (v as { toString: () => string }).toString()
                      const n = Number(s)
                      return Number.isNaN(n) ? undefined : n
                    }
                    return undefined
                  })()
                )}
              </span>
            </div>
            {booking.discountAmount && Number(booking.discountAmount) > 0 && (
              <div className="text-sm text-green-600">
                -{formatCurrency(Number(booking.discountAmount))} discount
              </div>
            )}
            {booking.payment && (
              <div className="text-sm text-muted-foreground">
                Payment: {booking.payment.status}
              </div>
            )}
          </div>
        )
      },
    },
    {
      header: 'Created',
      accessorKey: 'createdAt',
      cell: ({ row }: { row: Row<Booking> }) => {
        return (
          <div className="text-sm text-muted-foreground">
            {formatDateTime(row.original.createdAt)}
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: filteredBookings,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
    },
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.values(BOOKING_STATUS).map(status => (
                <SelectItem key={status} value={status}>
                  <Badge variant={getStatusBadgeVariant(status)}>
                    {status}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table
              .getHeaderGroups()
              .map((headerGroup: HeaderGroup<Booking>) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(
                    (header: Header<Booking, unknown>) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  )}
                </TableRow>
              ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row: Row<Booking>) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell: Cell<Booking, unknown>) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No bookings found.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>Total bookings: {bookings.length}</span>
        <span>•</span>
        <span>Filtered: {filteredBookings.length}</span>
        <span>•</span>
        <span>
          Last updated:{' '}
          {bookings.length > 0
            ? new Date(
                Math.max(
                  ...bookings.map(item => new Date(item.updatedAt).getTime())
                )
              ).toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })
            : 'Never'}
        </span>
      </div>
    </div>
  )
}

export default BookingsTable
