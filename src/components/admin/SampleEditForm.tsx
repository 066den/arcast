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
import VideoUpload from '@/components/ui/VideoUpload'
import Image from 'next/image'
import {
  ApiError,
  updateSample,
  uploadSampleImage,
  deleteSampleImage,
} from '@/lib/api'
import { ASPECT_RATIOS } from '@/lib/constants'

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
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleVideoSelect = (videoUrl: string, videoFile?: File) => {
    setFormData(prev => ({
      ...prev,
      videoUrl,
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
        videoUrl: formData.videoUrl || sample.videoUrl, // Keep existing videoUrl if new one is empty
        serviceTypeId:
          formData.serviceTypeId === 'none' ? null : formData.serviceTypeId,
        thumbnailFile,
      }

      await updateSample(sample.id, dataToSubmit)
      toast.success('Sample updated successfully')
      router.push('/admin/samples')
    } catch (error) {
      
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
                  {serviceTypes.length > 0 ? (
                    serviceTypes.map(serviceType => (
                      <SelectItem key={serviceType.id} value={serviceType.id}>
                        {serviceType.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="No service types found">
                      No service types found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <VideoUpload
          onVideoSelect={handleVideoSelect}
          initialVideoUrl={sample.videoUrl || ''}
          className="w-full"
        />

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
                onUpload={setThumbnailFile}
                aspectRatio={ASPECT_RATIOS.SQUARE}
                showCrop={true}
                size="medium"
                className="mx-auto"
              />
            </div>

            {sample.thumbUrl && (
              <div className="space-y-4">
                <Label size="default">Current Thumbnail</Label>
                <div className="relative group max-w-md">
                  <div className="relative aspect-square w-full h-48 rounded-lg overflow-hidden">
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
