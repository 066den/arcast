'use client'

import { useState } from 'react'
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
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { ArrowLeft, Plus, Trash2, Save, Edit, X } from 'lucide-react'
import ImageEditable from '@/components/ui/ImageEditable'
import Image from 'next/image'
import {
  ApiError,
  updateCaseStudy,
  uploadCaseStudyImage,
  deleteCaseStudyImage,
  uploadContentSectionImage,
  deleteContentSectionImage,
} from '@/lib/api'

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
    text: string[]
    list: string[]
    imageUrl: string
    order: number
  }>
}

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

interface CaseStudyEditFormProps {
  caseStudy: CaseStudy
  clients: Client[]
  staff: Staff[]
  equipment: Equipment[]
}

export default function CaseStudyEditForm({
  caseStudy,
  clients,
  staff,
  equipment,
}: CaseStudyEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: caseStudy.title || '',
    tagline: caseStudy.tagline || '',
    mainText: caseStudy.mainText || '',
    isActive: caseStudy.isActive,
    clientId: caseStudy.client?.id || 'none',
    staffIds: caseStudy.staff.map(s => s.id),
    equipmentIds: caseStudy.equipment.map(e => e.id),
    // Only keep the first image (index 0) if multiple exist
    imageUrls:
      caseStudy.imageUrls && caseStudy.imageUrls.length > 0
        ? [caseStudy.imageUrls[0]]
        : [],
    caseContent: caseStudy.caseContent,
  })

  const [newContentSection, setNewContentSection] = useState({
    title: '',
    text: '',
    list: '',
    imageUrl: '',
  })
  const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(
    null
  )
  const [editingSection, setEditingSection] = useState({
    title: '',
    text: '',
    list: '',
    imageUrl: '',
  })

  const handleInputChange = (field: string, value: string | boolean) => {
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

  const handleNewSectionImageUpload = async (file: File) => {
    try {
      const imageUrl = await uploadContentSectionImage(file, 'case-studies')
      setNewContentSection(prev => ({
        ...prev,
        imageUrl,
      }))
      toast.success('Image uploaded successfully')
    } catch (error) {
      toast.error('Failed to upload image')
      console.error('Image upload error:', error)
    }
  }

  const addContentSection = () => {
    if (newContentSection.title.trim()) {
      const newSection = {
        id: `temp-${Date.now()}`,
        title: newContentSection.title,
        text: newContentSection.text.split('\n').filter(line => line.trim()),
        list: newContentSection.list.split('\n').filter(line => line.trim()),
        imageUrl: newContentSection.imageUrl,
        order: formData.caseContent.length,
      }

      setFormData(prev => ({
        ...prev,
        caseContent: [...prev.caseContent, newSection],
      }))

      setNewContentSection({
        title: '',
        text: '',
        list: '',
        imageUrl: '',
      })
    }
  }

  const removeContentSection = (index: number) => {
    setFormData(prev => ({
      ...prev,
      caseContent: prev.caseContent.filter((_, i) => i !== index),
    }))
    // Cancel editing if the section being removed is being edited
    if (editingSectionIndex === index) {
      setEditingSectionIndex(null)
      setEditingSection({ title: '', text: '', list: '', imageUrl: '' })
    }
  }

  const [originalEditingSectionImage, setOriginalEditingSectionImage] =
    useState<string>('')

  const startEditingSection = (index: number) => {
    const section = formData.caseContent[index]
    const originalImageUrl = section.imageUrl || ''
    setEditingSectionIndex(index)
    setOriginalEditingSectionImage(originalImageUrl)
    setEditingSection({
      title: section.title,
      text: section.text.join('\n'),
      list: section.list.join('\n'),
      imageUrl: originalImageUrl,
    })
  }

  const cancelEditingSection = async (isSaving: boolean = false) => {
    // Delete newly uploaded image if it was changed and not saved
    // Only delete if we're canceling, not if we're saving
    if (
      !isSaving &&
      editingSection.imageUrl &&
      editingSection.imageUrl !== originalEditingSectionImage
    ) {
      try {
        await deleteContentSectionImage(editingSection.imageUrl)
      } catch {
        // Ignore deletion errors
      }
    }

    setEditingSectionIndex(null)
    setEditingSection({ title: '', text: '', list: '', imageUrl: '' })
    setOriginalEditingSectionImage('')
  }

  const saveEditingSection = async () => {
    if (editingSectionIndex === null) return

    if (!editingSection.title.trim()) {
      toast.error('Title is required')
      return
    }

    // Delete old image if it was replaced with a new one or removed
    const oldSection = formData.caseContent[editingSectionIndex]
    if (
      oldSection.imageUrl &&
      oldSection.imageUrl !== editingSection.imageUrl
    ) {
      try {
        await deleteContentSectionImage(oldSection.imageUrl)
      } catch {
        // Ignore deletion errors
      }
    }

    const updatedSection = {
      ...formData.caseContent[editingSectionIndex],
      title: editingSection.title,
      text: editingSection.text.split('\n').filter(line => line.trim()),
      list: editingSection.list.split('\n').filter(line => line.trim()),
      imageUrl: editingSection.imageUrl,
    }

    setFormData(prev => ({
      ...prev,
      caseContent: prev.caseContent.map((section, index) =>
        index === editingSectionIndex ? updatedSection : section
      ),
    }))

    // Pass true to indicate we're saving, so don't delete the new image
    cancelEditingSection(true)
    toast.success('Section updated successfully')
  }

  const handleEditingSectionImageUpload = async (file: File) => {
    try {
      const imageUrl = await uploadContentSectionImage(file, 'case-studies')
      setEditingSection(prev => ({
        ...prev,
        imageUrl,
      }))
      toast.success('Image uploaded successfully')
    } catch (error) {
      toast.error('Failed to upload image')
      console.error('Image upload error:', error)
    }
  }

  const handleImageUpload = async (file: File) => {
    setIsLoading(true)
    try {
      const result = (await uploadCaseStudyImage(caseStudy.id, file)) as {
        success: boolean
        message: string
        imageUrl: string
      }

      // Replace image at index 0 (only one image allowed)
      setFormData(prev => ({
        ...prev,
        imageUrls: [result.imageUrl],
      }))

      toast.success('Image uploaded successfully')
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message)
      } else {
        toast.error('Failed to upload image')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageRemove = async (imageUrl: string) => {
    setIsLoading(true)
    try {
      await deleteCaseStudyImage(caseStudy.id, imageUrl)

      // Clear the image array (only one image at index 0)
      setFormData(prev => ({
        ...prev,
        imageUrls: [],
      }))

      toast.success('Image removed successfully')
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message)
      } else {
        toast.error('Failed to remove image')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Convert "none" to null for clientId
      // Ensure only one image is saved (at index 0)
      const submitData = {
        ...formData,
        clientId: formData.clientId === 'none' ? null : formData.clientId,
        imageUrls:
          formData.imageUrls && formData.imageUrls.length > 0
            ? [formData.imageUrls[0]]
            : [],
      }

      await updateCaseStudy(caseStudy.id, submitData)

      toast.success('Case study updated successfully')
      router.push('/admin/case-studies')
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold">Edit Case Study</h2>
          <p className="text-muted-foreground">
            Update the case study details and content
          </p>
        </div>
        <Button type="submit" disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title" size="default">
                Title
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e => handleInputChange('title', e.target.value)}
                placeholder="Enter case study title"
              />
            </div>

            <div>
              <Label htmlFor="tagline" size="default">
                Tagline
              </Label>
              <Input
                id="tagline"
                value={formData.tagline}
                onChange={e => handleInputChange('tagline', e.target.value)}
                placeholder="Enter tagline"
              />
            </div>

            <div>
              <Label htmlFor="mainText" size="default">
                Main Text
              </Label>
              <Textarea
                id="mainText"
                value={formData.mainText}
                onChange={e => handleInputChange('mainText', e.target.value)}
                placeholder="Enter main description"
                rows={4}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={checked =>
                  handleInputChange('isActive', checked)
                }
              />
              <Label htmlFor="isActive" size="default">
                Active
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Client Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Client</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="client" size="default">
                Select Client
              </Label>
              <Select
                value={formData.clientId}
                onValueChange={value => handleInputChange('clientId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No client</SelectItem>
                  {clients
                    .filter(client => client.id && client.id.trim() !== '')
                    .map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}{' '}
                        {client.showTitle && `(${client.showTitle})`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {staff.map(member => (
              <div key={member.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`staff-${member.id}`}
                  checked={formData.staffIds.includes(member.id)}
                  onCheckedChange={() => handleStaffToggle(member.id)}
                />
                <Label htmlFor={`staff-${member.id}`} size="sm">
                  {member.name}
                  {member.role && (
                    <span className="text-muted-foreground ml-1">
                      ({member.role})
                    </span>
                  )}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Equipment Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment Used</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {equipment.map(item => (
              <div key={item.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`equipment-${item.id}`}
                  checked={formData.equipmentIds.includes(item.id)}
                  onCheckedChange={() => handleEquipmentToggle(item.id)}
                />
                <Label htmlFor={`equipment-${item.id}`} size="sm">
                  {item.name}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload new image */}
          <div>
            <Label size="default" className="mb-2 block">
              Upload New Image
            </Label>
            <ImageEditable
              onUpload={handleImageUpload}
              aspectRatio={16 / 9}
              showCrop={true}
              size="medium"
              className="mx-auto"
              src={formData.imageUrls[0]}
            />
          </div>

          {/* Current image (only one at index 0) */}
          {formData.imageUrls[0] && (
            <div className="space-y-4">
              <Label size="default">Current Image</Label>
              <div className="relative group w-full max-w-md">
                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                  <Image
                    src={formData.imageUrls[0]}
                    alt="Case study main image"
                    fill
                    className="object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleImageRemove(formData.imageUrls[0])}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Sections */}
      <Card>
        <CardHeader>
          <CardTitle>Content Sections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Existing Content Sections */}
          {formData.caseContent.map((section, index) => (
            <div key={section.id} className="border rounded-lg p-4 space-y-4">
              {editingSectionIndex === index ? (
                // Edit Mode
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Edit Section {index + 1}</h4>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => cancelEditingSection()}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={saveEditingSection}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`editSectionTitle-${index}`} size="default">
                      Title
                    </Label>
                    <Input
                      id={`editSectionTitle-${index}`}
                      value={editingSection.title}
                      onChange={e =>
                        setEditingSection(prev => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Enter section title"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`editSectionText-${index}`} size="default">
                      Text (one per line)
                    </Label>
                    <Textarea
                      id={`editSectionText-${index}`}
                      value={editingSection.text}
                      onChange={e =>
                        setEditingSection(prev => ({
                          ...prev,
                          text: e.target.value,
                        }))
                      }
                      placeholder="Enter text content, one paragraph per line"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`editSectionList-${index}`} size="default">
                      List Items (one per line)
                    </Label>
                    <Textarea
                      id={`editSectionList-${index}`}
                      value={editingSection.list}
                      onChange={e =>
                        setEditingSection(prev => ({
                          ...prev,
                          list: e.target.value,
                        }))
                      }
                      placeholder="Enter list items, one per line"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label size="default">Image</Label>
                    <div className="space-y-2">
                      <ImageEditable
                        className="mt-4"
                        size="small"
                        alt="Content Section Image"
                        onUpload={handleEditingSectionImageUpload}
                        src={editingSection.imageUrl || undefined}
                        showCrop={false}
                      />
                      {editingSection.imageUrl && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              await deleteContentSectionImage(
                                editingSection.imageUrl
                              )
                              setEditingSection(prev => ({
                                ...prev,
                                imageUrl: '',
                              }))
                              toast.success('Image removed')
                            } catch {
                              toast.error('Failed to remove image')
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Image
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // View Mode
                <>
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">
                      Section {index + 1}: {section.title}
                    </h4>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => startEditingSection(index)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeContentSection(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {section.text.length > 0 && (
                    <div>
                      <Label size="sm" className="font-medium">
                        Text:
                      </Label>
                      <div className="text-sm text-muted-foreground">
                        {section.text.map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {section.list.length > 0 && (
                    <div>
                      <Label size="sm" className="font-medium">
                        List:
                      </Label>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        {section.list.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {section.imageUrl && (
                    <div>
                      <Label size="sm" className="font-medium">
                        Image:
                      </Label>
                      <div className="relative aspect-[4/3] w-full max-w-xs rounded-lg overflow-hidden mt-2">
                        <Image
                          src={section.imageUrl}
                          alt={`Section ${index + 1} image`}
                          fill
                          sizes="100px"
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}

          <Separator />

          {/* Add New Content Section */}
          <div className="space-y-4">
            <h4 className="font-medium">Add New Content Section</h4>

            <div>
              <Label htmlFor="newSectionTitle" size="default">
                Title
              </Label>
              <Input
                id="newSectionTitle"
                value={newContentSection.title}
                onChange={e =>
                  setNewContentSection(prev => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="Enter section title"
              />
            </div>

            <div>
              <Label htmlFor="newSectionText" size="default">
                Text (one per line)
              </Label>
              <Textarea
                id="newSectionText"
                value={newContentSection.text}
                onChange={e =>
                  setNewContentSection(prev => ({
                    ...prev,
                    text: e.target.value,
                  }))
                }
                placeholder="Enter text content, one paragraph per line"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="newSectionList" size="default">
                List Items (one per line)
              </Label>
              <Textarea
                id="newSectionList"
                value={newContentSection.list}
                onChange={e =>
                  setNewContentSection(prev => ({
                    ...prev,
                    list: e.target.value,
                  }))
                }
                placeholder="Enter list items, one per line"
                rows={3}
              />
            </div>

            <div>
              <Label size="default">Image</Label>
              <ImageEditable
                className="mt-4"
                size="small"
                alt="Content Section Image"
                onUpload={handleNewSectionImageUpload}
                src={newContentSection.imageUrl || undefined}
                showCrop={false}
              />
            </div>

            <Button type="button" onClick={addContentSection}>
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
