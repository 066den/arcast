'use client'

import { useState, useTransition } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { Badge } from '../ui/badge'
import { Checkbox } from '../ui/checkbox'
import { Input } from '../ui/input'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import { updateClient, deleteClient } from '@/lib/api'
import ClientForm from './ClientForm'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { Button } from '../ui/button'

import type { ClientRow } from '@/types/admin'

export default function ClientsTable({
  initialData,
}: {
  initialData: ClientRow[]
}) {
  const [clients, setClients] = useState(initialData)
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState<ClientRow | undefined>(undefined)

  const filtered = clients.filter(c => {
    const s = search.toLowerCase()
    return (
      (c.name || '').toLowerCase().includes(s) ||
      (c.jobTitle || '').toLowerCase().includes(s) ||
      (c.showTitle || '').toLowerCase().includes(s)
    )
  })

  const toggleFeatured = async (id: string, value: boolean) => {
    try {
      startTransition(() => {
        setClients(prev =>
          prev.map(c => (c.id === id ? { ...c, featured: value } : c))
        )
      })
      await updateClient(id, { featured: value })
      toast.success('Client updated')
    } catch {
      toast.error('Failed to update client')
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Search clients..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              onClick={() => {
                setEdit(undefined)
                setOpen(true)
              }}
            >
              New Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[720px] p-4">
            <DialogHeader>
              <DialogTitle>{edit ? 'Edit Client' : 'New Client'}</DialogTitle>
            </DialogHeader>
            <ClientForm
              initial={edit}
              onSaved={saved => {
                setOpen(false)
                setClients((prev: ClientRow[]) => {
                  const exists = prev.find(c => c.id === saved.id)
                  if (exists)
                    return prev.map(c =>
                      c.id === saved.id ? saved : c
                    ) as ClientRow[]
                  return [saved as ClientRow, ...prev]
                })
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Show Title</TableHead>
              <TableHead>Testimonial</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(c => (
              <TableRow
                key={c.id}
                onDoubleClick={() => {
                  setEdit(c)
                  setOpen(true)
                }}
                className="cursor-pointer"
              >
                <TableCell>
                  <div className="font-medium">{c.name || '—'}</div>
                  {(c.showTitle || c.jobTitle) && (
                    <div className="text-sm text-muted-foreground">
                      {c.showTitle || c.jobTitle}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{c.jobTitle || '—'}</Badge>
                </TableCell>
                <TableCell>{c.showTitle || '—'}</TableCell>
                <TableCell>
                  <div className="max-w-[260px] truncate text-sm text-muted-foreground">
                    {c.testimonial || '—'}
                  </div>
                </TableCell>
                <TableCell>
                  {c.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.imageUrl}
                      alt={c.name || ''}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={c.featured}
                    onCheckedChange={v => toggleFeatured(c.id, Boolean(v))}
                    aria-label="Toggle featured"
                    disabled={isPending}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setEdit(c)
                        setOpen(true)
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        if (!confirm('Delete this client?')) return
                        try {
                          await deleteClient(c.id)
                          setClients(prev => prev.filter(x => x.id !== c.id))
                          toast.success('Client deleted')
                        } catch {
                          toast.error('Failed to delete client')
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
