'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Plus, Edit, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'
import {
  ApiError,
  deleteCaseStudy,
  updateCaseStudy,
  getCaseStudies,
} from '@/lib/api'
import AddCaseStudyModal from './AddCaseStudyModal'
import useFlag from '@/hooks/useFlag'

interface CaseStudy {
  id: string
  title: string | null
  tagline: string | null
  mainText: string | null
  isActive: boolean
  imageUrls: string[]
  client: {
    id: string
    name: string | null
    showTitle: string | null
    jobTitle: string | null
  } | null
  staff: Array<{
    id: string
    name: string | null
    role: string | null
  }>
  equipment: Array<{
    id: string
    name: string | null
  }>
  caseContent: Array<{
    id: string
    title: string
    order: number
  }>
}

interface CaseStudiesTableProps {
  initialData: CaseStudy[]
}

export default function CaseStudiesTable({
  initialData,
}: CaseStudiesTableProps) {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [isAddModalOpen, openAddModal, closeAddModal] = useFlag()

  const handleAddSuccess = async () => {
    try {
      const updatedCaseStudies = (await getCaseStudies()) as CaseStudy[]
      setCaseStudies(updatedCaseStudies)
    } catch {
      toast.error('Failed to refresh case studies')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this case study?')) {
      return
    }

    setIsLoading(true)
    try {
      await deleteCaseStudy(id)

      setCaseStudies(prev => prev.filter(cs => cs.id !== id))
      toast.success('Case study deleted successfully')
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message)
      } else {
        toast.error('Failed to delete case study')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setIsLoading(true)
    try {
      await updateCaseStudy(id, {
        isActive: !currentStatus,
      })

      setCaseStudies(prev =>
        prev.map(cs =>
          cs.id === id ? { ...cs, isActive: !currentStatus } : cs
        )
      )
      toast.success(
        `Case study ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      )
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message)
      } else {
        toast.error('Failed to update case study')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleView = (caseStudy: CaseStudy) => {
    window.open(`/case-studies/${caseStudy.id}`, '_blank')
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold">Case Studies</h2>
          <Badge variant="secondary">{caseStudies.length} total</Badge>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="h-4 w-4 mr-2" />
          Add Case Study
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Preview</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead>Equipment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Content Sections</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {caseStudies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="text-muted-foreground">
                    No case studies found. Create your first case study to get
                    started.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              caseStudies.map(caseStudy => (
                <TableRow key={caseStudy.id}>
                  <TableCell>
                    {caseStudy.imageUrls.length > 0 ? (
                      <div className="relative w-16 h-16 rounded-md overflow-hidden">
                        <Image
                          src={caseStudy.imageUrls[0]}
                          alt={caseStudy.title || 'Case study preview'}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">
                          No image
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {caseStudy.title || 'Untitled Case Study'}
                      </div>
                      {caseStudy.tagline && (
                        <div className="text-sm text-muted-foreground">
                          {caseStudy.tagline}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {caseStudy.client ? (
                      <div>
                        <div className="font-medium">
                          {caseStudy.client.name}
                        </div>
                        {caseStudy.client.showTitle && (
                          <div className="text-sm text-muted-foreground">
                            {caseStudy.client.showTitle}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No client</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {caseStudy.staff.slice(0, 2).map(staff => (
                        <div key={staff.id} className="text-sm">
                          {staff.name}
                        </div>
                      ))}
                      {caseStudy.staff.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{caseStudy.staff.length - 2} more
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {caseStudy.equipment.slice(0, 2).map(equipment => (
                        <div key={equipment.id} className="text-sm">
                          {equipment.name}
                        </div>
                      ))}
                      {caseStudy.equipment.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{caseStudy.equipment.length - 2} more
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={caseStudy.isActive ? 'default' : 'secondary'}
                    >
                      {caseStudy.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {caseStudy.caseContent.length} sections
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(caseStudy)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Case Study
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/admin/case-studies/edit/${caseStudy.id}`}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleToggleActive(caseStudy.id, caseStudy.isActive)
                          }
                          disabled={isLoading}
                        >
                          {caseStudy.isActive ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(caseStudy.id)}
                          disabled={isLoading}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AddCaseStudyModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onSuccess={handleAddSuccess}
      />
    </div>
  )
}
