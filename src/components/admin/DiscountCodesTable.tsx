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
import { Badge } from '../ui/badge'
import { Checkbox } from '../ui/checkbox'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Calendar, Filter, Percent, Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import {
  createDiscountCode,
  deleteDiscountCode,
  updateDiscountCode,
} from '@/lib/api'

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
}

export default function DiscountCodesTable({
  initialData,
}: {
  initialData: Code[]
}) {
  const [codes, setCodes] = useState(initialData)
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()

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
          onClick={() =>
            toast.message('Use API createDiscountCode to add new code')
          }
        >
          <Plus className="h-4 w-4" /> New Code
        </Button>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Usage</TableHead>
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
                    onChecked={v => toggleActive(c.id, Boolean(v))}
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
