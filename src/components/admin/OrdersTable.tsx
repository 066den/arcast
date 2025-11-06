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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Input } from '../ui/input'
import { Calendar, CreditCard, Filter, Search } from 'lucide-react'
import { toast } from 'sonner'
import { ORDER_STATUS } from '@/lib/constants'
import type { OrderRow } from '@/types/admin'

interface Props {
  initialData: OrderRow[]
}

export default function OrdersTable({ initialData }: Props) {
  const [orders, setOrders] = useState(initialData)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = useMemo(
    () =>
      orders.filter(o => {
        const s = search.toLowerCase()
        const matches =
          o.serviceName.toLowerCase().includes(s) ||
          o.lead.fullName.toLowerCase().includes(s) ||
          (o.lead.email || '').toLowerCase().includes(s)
        const matchesStatus = status === 'all' || o.status === status
        return matches && matchesStatus
      }),
    [orders, search, status]
  )

  const formatCurrency = (n?: number | null) =>
    typeof n === 'number'
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(n)
      : '—'

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

  const handleStatusChange = async (
    orderId: string,
    next: keyof typeof ORDER_STATUS | string
  ) => {
    try {
      setLoadingId(orderId)
      // TODO: wire to API when endpoint for updating order status is added
      startTransition(() => {
        setOrders(prev =>
          prev.map(o => (o.id === orderId ? { ...o, status: next } : o))
        )
      })
      toast.success('Order status updated')
    } catch (e) {
      toast.error('Failed to update order')
    } finally {
      setLoadingId(null)
    }
  }

  const statusBadge = (s: string) => {
    switch (s) {
      case ORDER_STATUS.PENDING:
        return 'secondary'
      case ORDER_STATUS.CONFIRMED:
      case ORDER_STATUS.IN_PROGRESS:
        return 'default'
      case ORDER_STATUS.COMPLETED:
        return 'default'
      case ORDER_STATUS.CANCELLED:
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
            placeholder="Search orders..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.values(ORDER_STATUS)
                .filter(s => s && s.trim() !== '')
                .map(s => (
                  <SelectItem key={s} value={s}>
                    <Badge variant={statusBadge(s)}>{s}</Badge>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(o => (
              <TableRow key={o.id}>
                <TableCell>
                  <div className="max-w-[220px]">
                    <div className="font-medium truncate">
                      {o.lead.fullName}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {o.lead.email || '—'}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-[260px]">
                    <div className="font-medium truncate">
                      {o.serviceName || '—'}
                    </div>
                    {o.requirements && (
                      <div className="text-sm text-muted-foreground truncate">
                        {o.requirements}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={o.status}
                    onValueChange={v => handleStatusChange(o.id, v)}
                    disabled={loadingId === o.id || isPending}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue>
                        <Badge variant={statusBadge(o.status)}>
                          {o.status}
                        </Badge>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ORDER_STATUS)
                        .filter(s => s && s.trim() !== '')
                        .map(s => (
                          <SelectItem key={s} value={s}>
                            <Badge variant={statusBadge(s)}>{s}</Badge>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="max-w-[180px]">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {formatCurrency(o.finalAmount ?? o.totalCost)}
                      </span>
                    </div>
                    {o.payment && (
                      <div className="text-sm text-muted-foreground">
                        Payment: {o.payment.status}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDate(o.createdAt)}
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
