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

interface BookingsTableProps {
  initialData: Booking[]
}

const BookingsTable = ({ initialData }: BookingsTableProps) => {
  const [data, setData] = useState(initialData)

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const columns: ColumnDef<Booking>[] = [
    {
      header: 'Customer',
      accessorKey: 'name',
      cell: ({ row }: { row: Row<Booking> }) => {
        return <div>{row.original.lead?.fullName || 'N/A'}</div>
      },
    },
    {
      header: 'Booking Date',
      accessorKey: 'email',
      cell: ({ row }: { row: Row<Booking> }) => {
        return <div>{row.original.lead?.email || 'N/A'}</div>
      },
    },
    {
      header: 'Setup',
      accessorKey: 'studio.name',
      cell: ({ row }: { row: Row<Booking> }) => {
        return <div>{row.original.studio?.name || 'N/A'}</div>
      },
    },
    {
      header: 'Status',
      accessorKey: 'payment.provider',
      cell: ({ row }: { row: Row<Booking> }) => {
        return <div>Payment Method</div>
      },
    },
    {
      header: 'Payment',
      accessorKey: 'payment',
      cell: ({ row }: { row: Row<Booking> }) => {
        return <div>Payment cost</div>
      },
    },
    {
      header: 'Created Date',
      accessorKey: 'createdAt',
      cell: ({ row }: { row: Row<Booking> }) => {
        return (
          <div>
            {row.original.createdAt
              ? new Date(row.original.createdAt).toLocaleDateString()
              : 'N/A'}
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
    },
  })
  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup: HeaderGroup<Booking>) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header: Header<Booking, unknown>) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row: Row<Booking>) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell: Cell<Booking, unknown>) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default BookingsTable
