'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ImageEditable from '@/components/ui/ImageEditable'
import Image from 'next/image'
import {
  ApiError,
  updateSample,
  uploadSampleImage,
  deleteSampleImage,
} from '@/lib/api'

interface Sample {
  id: string
  name: string | null
  thumbUrl: string | null
  videoUrl: string | null
  serviceTypeId: string | null
  serviceType?: {
    id: string
    name: string
  } | null
}

interface ServiceType {
  id: string
  name: string
}

interface SampleEditFormProps {
  sample: Sample
  serviceTypes: ServiceType[]
}

export default function SampleEditForm({
  sample,
  serviceTypes,
}: SampleEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: sample.name || '',
    videoUrl: sample.videoUrl || '',
    serviceTypeId: sample.serviceTypeId || 'none',
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleImageUpload = async (file: File) => {
    setIsLoading(true)
    try {
      const result = (await uploadSampleImage(sample.id, file)) as {
        success: boolean
        message: string
        imageUrl: string
      }
      toast.success('Image uploaded successfully')
    } catch (error) {
      console.error('Error uploading image:', error)
      if (error instanceof ApiError) {
        toast.error(error.message)
      } else {
        toast.error('Failed to upload image')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageRemove = async () => {
    setIsLoading(true)
    try {
      await deleteSampleImage(sample.id)
      toast.success('Image removed successfully')
    } catch (error) {
      console.error('Error removing image:', error)
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
      const dataToSubmit = {
        name: formData.name,
        videoUrl: formData.videoUrl,
        serviceTypeId:
          formData.serviceTypeId === 'none' ? null : formData.serviceTypeId,
      }

      await updateSample(sample.id, dataToSubmit)
      toast.success('Sample updated successfully')
      router.push('/admin/samples')
    } catch (error) {
      console.error('Error updating sample:', error)
      if (error instanceof ApiError) {
        toast.error(error.message)
      } else {
        toast.error('Failed to update sample')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/admin/samples')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Samples
        </Button>
        <h2 className="text-2xl font-bold">Edit Sample</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label size="default" htmlFor="name">
                Sample Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                placeholder="Enter sample name"
                required
              />
            </div>

            <div>
              <Label size="default" htmlFor="videoUrl">
                Video URL
              </Label>
              <Input
                id="videoUrl"
                value={formData.videoUrl}
                onChange={e => handleInputChange('videoUrl', e.target.value)}
                placeholder="Enter video URL"
                type="url"
              />
            </div>

            <div>
              <Label size="default" htmlFor="serviceType">
                Service Type
              </Label>
              <Select
                value={formData.serviceTypeId}
                onValueChange={value =>
                  handleInputChange('serviceTypeId', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No service type</SelectItem>
                  {serviceTypes.map(serviceType => (
                    <SelectItem key={serviceType.id} value={serviceType.id}>
                      {serviceType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thumbnail Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label size="default" className="mb-2 block">
                Upload New Thumbnail
              </Label>
              <ImageEditable
                onUpload={handleImageUpload}
                aspectRatio={16 / 9}
                showCrop={true}
                size="medium"
                className="mx-auto"
              />
            </div>

            {sample.thumbUrl && (
              <div className="space-y-4">
                <Label size="default">Current Thumbnail</Label>
                <div className="relative group max-w-md">
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <Image
                      src={sample.thumbUrl}
                      alt="Sample thumbnail"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleImageRemove}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleBack}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
