'use client'

import { Booking } from '@/types'
import { useState } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type VisibilityState,
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
      header: 'Setup',
      accessorKey: 'studio.name',
      cell: ({ row }) => {
        return <div>{row.original.studio.name}</div>
      },
    },
    {
      header: 'Status',
      accessorKey: 'payment.provider',
      cell: ({ row }) => {
        return <div>Payment Method</div>
      },
    },
    {
      header: 'Payment',
      accessorKey: 'payment',
      cell: ({ row }) => {
        return <div>Payment cost</div>
      },
    },
    {
      header: 'Created Date',
      accessorKey: 'createdAt',
      cell: ({ row }) => {
        return <div>{row.original.createdAt}</div>
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
