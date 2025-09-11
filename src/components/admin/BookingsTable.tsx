'use client'

import { Booking } from '@/types'
import { useState } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  VisibilityState,
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
      accessorKey: 'name',
      header: 'Customer',
      cell: ({ row }) => {
        return <div>{row.original.lead.fullName}</div>
      },
    },
    {
      header: 'Booking Date',
      accessorKey: 'email',
      cell: ({ row }) => {
        return <div>{row.original.lead.email}</div>
      },
    },
    {
      header: 'Number of Guests',
      accessorKey: 'lead.phoneNumber',
      cell: ({ row }) => {
        return <div>{row.original.lead.phoneNumber}</div>
      },
    },
    {
      header: 'Customer Email',
      accessorKey: 'lead.whatsappNumber',
      cell: ({ row }) => {
        return <div>{row.original.discountAmount}</div>
      },
    },
    {
      header: 'Customer Phone',
      accessorKey: 'lead.phoneNumber',
      cell: ({ row }) => {
        return <div>{row.original.lead.phoneNumber}</div>
      },
    },
    {
      header: 'Setup',
      accessorKey: 'studio.name',
      cell: ({ row }) => {
        return <div>{row.original.studio.name}</div>
      },
    },
    {
      header: 'Package',
      accessorKey: 'package.name',
      cell: ({ row }) => {
        return <div>{row.original.package.name}</div>
      },
    },
    {
      header: 'Services',
      accessorKey: 'additionalServices',
      cell: ({ row }) => {
        return <div>additionalServices</div>
      },
    },
    {
      header: 'Payment Method',
      accessorKey: 'payment.provider',
      cell: ({ row }) => {
        return <div>Payment Method</div>
      },
    },
    {
      header: 'Status',
      accessorKey: 'payment.status',
      cell: ({ row }) => {
        return <div>Status</div>
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
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
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
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>{cell.getValue() as string}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default BookingsTable
