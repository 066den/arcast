'use client'

import { Sample } from '@/types'
import { useState } from 'react'
import Image from 'next/image'
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
  Image as ImageIcon,
  Play,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { toast } from 'sonner'
import { ConfirmModal } from '@/components/modals/modal'
import { ApiError, deleteSample, deleteSampleImage } from '@/lib/api'

interface SamplesTableProps {
  initialData: Sample[]
}

const SamplesTable = ({ initialData }: SamplesTableProps) => {
  const [samples, setSamples] = useState(initialData)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    sample: Sample | null
  }>({ isOpen: false, sample: null })
  const [isDeleting, setIsDeleting] = useState(false)

  // Normalize video URL to remove arcast-s3 bucket prefix
  const normalizeVideoUrl = (url: string | null): string => {
    if (!url) return ''
    if (url.includes('localhost:9000/arcast-s3/')) {
      return url.replace('arcast-s3/', '')
    }
    return url
  }

  const handleEdit = (sample: Sample) => {
    // Navigate to edit page
    window.location.href = `/admin/samples/edit/${sample.id}`
  }

  const handleDelete = (sample: Sample) => {
    setDeleteDialog({ isOpen: true, sample })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.sample) return

    setIsDeleting(true)
    try {
      await deleteSample(deleteDialog.sample.id)
      setSamples(prev =>
        prev.filter(item => item.id !== deleteDialog.sample!.id)
      )
      toast.success('Sample deleted successfully')
    } catch (error) {
      console.error('Delete error:', error)
      if (error instanceof ApiError) {
        toast.error(error.message)
      } else {
        toast.error('Error deleting sample')
      }
    } finally {
      setIsDeleting(false)
      setDeleteDialog({ isOpen: false, sample: null })
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, sample: null })
  }

  const handleView = (sample: Sample) => {
    if (sample.videoUrl) {
      const normalizedUrl = normalizeVideoUrl(sample.videoUrl)
      window.open(normalizedUrl, '_blank')
    } else {
      toast.error('No video URL available')
    }
  }

  const handleImageRemove = async (sampleId: string) => {
    try {
      await deleteSampleImage(sampleId)
      setSamples(prev =>
        prev.map(sample =>
          sample.id === sampleId ? { ...sample, thumbUrl: null } : sample
        )
      )
      toast.success('Image removed successfully')
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message)
      } else {
        toast.error('Failed to remove image')
      }
    }
  }

  const handleCreate = () => {
    window.location.href = '/admin/samples/create'
  }

  const columns: ColumnDef<Sample>[] = [
    {
      header: 'Preview',
      accessorKey: 'thumbUrl',
      cell: ({ row }: { row: Row<Sample> }) => {
        const thumbUrl = row.original.thumbUrl

        return (
          <div className="w-16 h-12 flex items-center justify-center">
            {thumbUrl ? (
              <Image
                src={thumbUrl}
                alt="Sample preview"
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
              className={`w-full h-full bg-muted rounded-md border flex items-center justify-center ${thumbUrl ? 'hidden' : ''}`}
            >
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        )
      },
    },
    {
      header: 'Name',
      accessorKey: 'name',
      cell: ({ row }: { row: Row<Sample> }) => {
        const name = row.original.name
        return (
          <div className="max-w-[300px]">
            <div className="font-medium truncate">
              {name || 'Untitled Sample'}
            </div>
            {row.original.serviceType && (
              <div className="text-sm text-muted-foreground truncate">
                {row.original.serviceType.name}
              </div>
            )}
          </div>
        )
      },
    },
    {
      header: 'Video URL',
      accessorKey: 'videoUrl',
      cell: ({ row }: { row: Row<Sample> }) => {
        const videoUrl = row.original.videoUrl
        const normalizedUrl = normalizeVideoUrl(videoUrl)
        return (
          <div className="max-w-[400px]">
            {normalizedUrl ? (
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground truncate">
                  {normalizedUrl.length > 50
                    ? `${normalizedUrl.substring(0, 50)}...`
                    : normalizedUrl}
                </span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">
                No video URL
              </span>
            )}
          </div>
        )
      },
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }: { row: Row<Sample> }) => {
        const sample = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleView(sample)}>
                <Eye className="mr-2 h-4 w-4" />
                View Video
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(sample)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Sample
              </DropdownMenuItem>
              {sample.thumbUrl && (
                <DropdownMenuItem onClick={() => handleImageRemove(sample.id)}>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Remove Image
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => handleDelete(sample)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Sample
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: samples,
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
        <h2 className="text-2xl font-bold tracking-tight">Samples</h2>

        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          New Sample
        </Button>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup: HeaderGroup<Sample>) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header: Header<Sample, unknown>) => (
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row: Row<Sample>) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell: Cell<Sample, unknown>) => (
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
                    <p className="text-muted-foreground">No samples found.</p>
                    <Button
                      onClick={handleCreate}
                      variant="outline"
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Create your first sample
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>Total samples: {samples.length}</span>
      </div>

      <ConfirmModal
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Sample"
        description={`Are you sure you want to delete "${deleteDialog.sample?.name || 'this sample'}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={isDeleting}
      />
    </div>
  )
}

export default SamplesTable
