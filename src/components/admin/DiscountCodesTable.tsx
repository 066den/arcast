'use client'

import { useMemo, useState, useTransition } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { Checkbox } from '../ui/checkbox'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Percent, Plus, Search, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { updateDiscountCode, getDiscountCodes } from '@/lib/api'
import AddDiscountCodeModal from './discount/AddDiscountCodeModal'

type Code = {
  id: string
  code: string
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | string
  value: number
  currency: string
  isActive: boolean
  startDate: string | Date
  endDate: string | Date
  usageLimit?: number | null
  usedCount?: number
  firstTimeOnly?: boolean
  minOrderAmount?: number | null
  applicableContentTypes?: string[]
  createdAt?: string | Date
}

export default function DiscountCodesTable({
  initialData,
}: {
  initialData: Code[]
}) {
  const [codes, setCodes] = useState(initialData)
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCode, setEditingCode] = useState<Code | null>(null)

  const filtered = useMemo(
    () =>
      codes.filter(c => c.code.toLowerCase().includes(search.toLowerCase())),
    [codes, search]
  )

  const toggleActive = async (id: string, value: boolean) => {
    try {
      startTransition(() =>
        setCodes(prev =>
          prev.map(c => (c.id === id ? { ...c, isActive: value } : c))
        )
      )
      await updateDiscountCode(id, { isActive: value })
      toast.success('Discount code updated')
    } catch {
      toast.error('Failed to update discount code')
    }
  }

  const handleRefresh = async () => {
    try {
      const updatedCodes = await getDiscountCodes()
      setCodes(updatedCodes as Code[])
    } catch {
      toast.error('Failed to refresh codes')
    }
  }

  const handleEditClick = (code: Code) => {
    setEditingCode(code)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingCode(null)
  }

  const formatDate = (d: string | Date) =>
    new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search codes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button
          size="sm"
          className="gap-2"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="h-4 w-4" /> New Code
        </Button>
      </div>

      <AddDiscountCodeModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleRefresh}
        editingCode={editingCode}
      />

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Restrictions</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(c => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="font-medium">{c.code}</div>
                  <div className="text-sm text-muted-foreground">{c.type}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {c.type === 'PERCENTAGE'
                        ? `${c.value}%`
                        : `${c.value} ${c.currency}`}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={c.isActive}
                    disabled={isPending}
                    onCheckedChange={(v: boolean) => toggleActive(c.id, v)}
                  />
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(c.startDate)} — {formatDate(c.endDate)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {c.usedCount ?? 0}
                    {c.usageLimit ? ` / ${c.usageLimit}` : ''}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm space-y-1">
                    {c.firstTimeOnly && (
                      <div className="text-blue-600">First-time only</div>
                    )}
                    {c.minOrderAmount && (
                      <div className="text-orange-600">
                        Min: {c.minOrderAmount} {c.currency}
                      </div>
                    )}
                    {c.applicableContentTypes &&
                      c.applicableContentTypes.length > 0 && (
                        <div className="text-purple-600">
                          {c.applicableContentTypes.join(', ')}
                        </div>
                      )}
                    {!c.firstTimeOnly &&
                      !c.minOrderAmount &&
                      !c.applicableContentTypes && (
                        <div className="text-muted-foreground">None</div>
                      )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(c.createdAt || c.startDate)}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditClick(c)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
