'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { ArrowLeft, Save } from 'lucide-react'
import ImageEditable from '@/components/ui/ImageEditable'
import { ASPECT_RATIOS } from '@/lib/constants'
import { ApiError, createCaseStudy, uploadCaseStudyImage } from '@/lib/api'
import { Preloader } from '@/components/ui/preloader'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Client {
  id: string
  name: string | null
  showTitle: string | null
  jobTitle: string | null
}

interface Staff {
  id: string
  name: string | null
  role: string | null
}

interface Equipment {
  id: string
  name: string | null
}

interface CreateCaseStudyFormProps {
  clients: Client[]
  staff: Staff[]
  equipment: Equipment[]
}

export default function CreateCaseStudyForm({
  clients,
  staff,
  equipment,
}: CreateCaseStudyFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    mainText: '',
    clientId: '__none__' as string,
    staffIds: [] as string[],
    equipmentIds: [] as string[],
    isActive: true,
  })

  // Set all staff and equipment as selected by default
  useEffect(() => {
    const allStaffIds = staff
      .filter(s => s.id && typeof s.id === 'string' && s.id.trim() !== '')
      .map(s => s.id as string)
    const allEquipmentIds = equipment
      .filter(e => e.id && typeof e.id === 'string' && e.id.trim() !== '')
      .map(e => e.id as string)

    setFormData(prev => ({
      ...prev,
      staffIds: allStaffIds,
      equipmentIds: allEquipmentIds,
    }))
  }, [staff, equipment])

  const handleInputChange = (
    field: string,
    value: string | boolean | string[] | undefined
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleStaffToggle = (staffId: string) => {
    setFormData(prev => ({
      ...prev,
      staffIds: prev.staffIds.includes(staffId)
        ? prev.staffIds.filter(id => id !== staffId)
        : [...prev.staffIds, staffId],
    }))
  }

  const handleEquipmentToggle = (equipmentId: string) => {
    setFormData(prev => ({
      ...prev,
      equipmentIds: prev.equipmentIds.includes(equipmentId)
        ? prev.equipmentIds.filter(id => id !== equipmentId)
        : [...prev.equipmentIds, equipmentId],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error('Title is required')
      return
    }

    setIsLoading(true)
    try {
      // Create case study first
      const createdCaseStudy = (await createCaseStudy({
        title: formData.title,
        tagline: formData.tagline || undefined,
        mainText: formData.mainText || undefined,
        clientId:
          formData.clientId === '__none__' ? undefined : formData.clientId,
        staffIds: formData.staffIds,
        equipmentIds: formData.equipmentIds,
        imageUrls: [],
        caseContent: [],
      })) as { id: string }

      // Upload image if provided
      if (imageFile && createdCaseStudy.id) {
        try {
          console.log('Uploading image for case study:', createdCaseStudy.id)
          await uploadCaseStudyImage(createdCaseStudy.id, imageFile)
          console.log('Image uploaded successfully')
        } catch (imageError) {
          console.error('Failed to upload image:', imageError)
          if (imageError instanceof ApiError) {
            toast.error(`Image upload failed: ${imageError.message}`)
          } else {
            toast.warning('Case study created but image upload failed')
          }
        }
      }

      toast.success('Case study created successfully')
      router.push(`/admin/case-studies/edit/${createdCaseStudy.id}`)
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message)
      } else {
        toast.error('Failed to create case study')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/case-studies">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Case Studies
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Preloader variant="wave" size="lg" text="Creating case study..." />
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={cn(
          'space-y-6',
          isLoading && 'pointer-events-none opacity-50'
        )}
      >
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label size="lg" htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e => handleInputChange('title', e.target.value)}
                placeholder="Enter case study title"
                disabled={isLoading}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label size="lg" htmlFor="tagline">
                Tagline
              </Label>
              <Input
                id="tagline"
                value={formData.tagline}
                onChange={e => handleInputChange('tagline', e.target.value)}
                placeholder="Enter tagline"
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label size="lg" htmlFor="mainText">
                Main Text
              </Label>
              <Textarea
                id="mainText"
                value={formData.mainText}
                onChange={e => handleInputChange('mainText', e.target.value)}
                placeholder="Enter main text"
                rows={4}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={checked =>
                  handleInputChange('isActive', checked === true)
                }
                disabled={isLoading}
              />
              <Label size="lg" htmlFor="isActive" className="cursor-pointer">
                Active (visible on website)
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Image */}
        <Card>
          <CardHeader>
            <CardTitle>Main Image</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageEditable
              src=""
              alt="Case study image"
              onUpload={file => setImageFile(file)}
              aspectRatio={ASPECT_RATIOS.LANDSCAPE}
              size="medium"
            />
          </CardContent>
        </Card>

        {/* Client Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Client</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={formData.clientId || '__none__'}
              onValueChange={value => {
                const safeValue = value === '' ? '__none__' : value
                handleInputChange('clientId', safeValue)
              }}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">No client</SelectItem>
                {clients
                  .filter(
                    client =>
                      client &&
                      client.id != null &&
                      client.id !== '' &&
                      String(client.id).trim() !== ''
                  )
                  .map(client => {
                    const clientId = String(client.id).trim()
                    // Double check that ID is valid before rendering
                    if (!clientId || clientId === '') {
                      return null
                    }
                    return (
                      <SelectItem key={clientId} value={clientId}>
                        {client.name || 'Unnamed client'}
                      </SelectItem>
                    )
                  })
                  .filter(Boolean)}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Staff Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {staff.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No staff available
                </p>
              ) : (
                staff.map(member => (
                  <div key={member.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`staff-${member.id}`}
                      checked={formData.staffIds.includes(member.id)}
                      onCheckedChange={() => handleStaffToggle(member.id)}
                      disabled={isLoading}
                    />
                    <Label
                      size="lg"
                      htmlFor={`staff-${member.id}`}
                      className="cursor-pointer flex-1"
                    >
                      {member.name} {member.role && `- ${member.role}`}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Equipment Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {equipment.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No equipment available
                </p>
              ) : (
                equipment.map(item => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`equipment-${item.id}`}
                      checked={formData.equipmentIds.includes(item.id)}
                      onCheckedChange={() => handleEquipmentToggle(item.id)}
                      disabled={isLoading}
                    />
                    <Label
                      size="lg"
                      htmlFor={`equipment-${item.id}`}
                      className="cursor-pointer flex-1"
                    >
                      {item.name}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/admin/case-studies">
            <Button type="button" variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Creating...' : 'Create Case Study'}
          </Button>
        </div>
      </form>
    </div>
  )
}
