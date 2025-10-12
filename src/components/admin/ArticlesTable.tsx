'use client'

import { BlogRecord } from '@/types'
import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
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
import { Button } from '../ui/button'
import {
  Edit,
  Trash2,
  Eye,
  Plus,
  MoreHorizontal,
  Calendar,
  Image as ImageIcon,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { stripHtml } from '@/utils/renderText'

interface ArticlesTableProps {
  initialData: BlogRecord[]
}

const ArticlesTable = ({ initialData }: ArticlesTableProps) => {
  const router = useRouter()
  const [data, setData] = useState(initialData)

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const handleEdit = (article: BlogRecord) => {
    // TODO: Implement edit functionality
    console.log('Edit article:', article.id)
  }

  const handleDelete = (article: BlogRecord) => {
    // TODO: Implement delete functionality with confirmation
    console.log('Delete article:', article.id)
    setData(prev => prev.filter(item => item.id !== article.id))
  }

  const handleView = (article: BlogRecord) => {
    // TODO: Implement view functionality
    console.log('View article:', article.id)
  }

  const handleCreate = () => {
    router.push('/admin/blog/create')
  }

  const columns: ColumnDef<BlogRecord>[] = [
    {
      header: 'Preview',
      accessorKey: 'mainImageUrl',
      cell: ({ row }: { row: Row<BlogRecord> }) => {
        const mainImageUrl = row.original.mainImageUrl

        return (
          <div className="w-16 h-12 flex items-center justify-center">
            {mainImageUrl ? (
              <Image
                src={mainImageUrl}
                alt="Article preview"
                width={64}
                height={48}
                className="w-full h-full object-cover rounded-md border"
                onError={e => {
                  const target = e.target as HTMLImageElement
                  const placeholder = target.nextElementSibling as HTMLElement
                  target.style.display = 'none'
                  if (placeholder) {
                    placeholder.classList.remove('hidden')
                  }
                }}
              />
            ) : null}
            <div
              className={`w-full h-full bg-muted rounded-md border flex items-center justify-center ${mainImageUrl ? 'hidden' : ''}`}
            >
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        )
      },
    },
    {
      header: 'Title',
      accessorKey: 'title',
      cell: ({ row }: { row: Row<BlogRecord> }) => {
        const title = row.original.title
        return (
          <div className="max-w-[300px]">
            <div className="font-medium truncate">
              {title || 'Untitled Article'}
            </div>
            {row.original.tagline && (
              <div className="text-sm text-muted-foreground truncate">
                {stripHtml(row.original.tagline)}
              </div>
            )}
          </div>
        )
      },
    },
    {
      header: 'Content',
      accessorKey: 'mainText',
      cell: ({ row }: { row: Row<BlogRecord> }) => {
        const mainText = row.original.mainText
        return (
          <div className="max-w-[400px]">
            <div className="text-sm text-muted-foreground truncate">
              {stripHtml(mainText || '')
                ? stripHtml(mainText || '').length > 100
                  ? `${stripHtml(mainText || '').substring(0, 100)}...`
                  : stripHtml(mainText || '')
                : 'No content'}
            </div>
          </div>
        )
      },
    },
    {
      header: 'Created',
      accessorKey: 'createdAt',
      cell: ({ row }: { row: Row<BlogRecord> }) => {
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              {row.original.createdAt
                ? new Date(row.original.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'N/A'}
            </div>
          </div>
        )
      },
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }: { row: Row<BlogRecord> }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleView(row.original)}>
                <Eye className="mr-2 h-4 w-4" />
                View Article
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(row.original)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Article
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(row.original)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Article
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Articles</h2>

        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          New Article
        </Button>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table
              .getHeaderGroups()
              .map((headerGroup: HeaderGroup<BlogRecord>) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(
                    (header: Header<BlogRecord, unknown>) => (
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
              table.getRowModel().rows.map((row: Row<BlogRecord>) => (
                <TableRow key={row.id}>
                  {row
                    .getVisibleCells()
                    .map((cell: Cell<BlogRecord, unknown>) => (
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
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No articles found.</p>
                    <Button
                      onClick={handleCreate}
                      variant="outline"
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Create your first article
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>Total articles: {data.length}</span>
        <span>•</span>
        <span>
          Last updated:{' '}
          {data.length > 0
            ? new Date(
                Math.max(
                  ...data.map(item => new Date(item.updatedAt).getTime())
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

export default ArticlesTable
