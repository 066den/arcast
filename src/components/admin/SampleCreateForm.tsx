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
import { ArrowLeft, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ImageEditable from '@/components/ui/ImageEditable'
import VideoUpload from '@/components/ui/VideoUpload'
import { ApiError, createSample } from '@/lib/api'
import { ASPECT_RATIOS } from '@/lib/constants'

interface ServiceType {
  id: string
  name: string
}

interface SampleCreateFormProps {
  serviceTypes: ServiceType[]
}

export default function SampleCreateForm({
  serviceTypes,
}: SampleCreateFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const filteredServiceTypes = serviceTypes.filter(
    serviceType => serviceType.name !== 'Beneficial Packages'
  )
  const [formData, setFormData] = useState({
    name: '',
    videoUrl: '',
    serviceTypeId:
      filteredServiceTypes.length > 0 ? filteredServiceTypes[0].id : null,
  })
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleVideoSelect = (videoUrl: string) => {
    setFormData(prev => ({ ...prev, videoUrl }))
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
        thumbnailFile,
      }

      await createSample(dataToSubmit)
      toast.success('Sample created successfully')
      router.push('/admin/samples')
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message)
      } else {
        toast.error('Failed to create sample')
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
        <h2 className="text-2xl font-bold">Create New Sample</h2>
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
                value={formData.serviceTypeId || undefined}
                onValueChange={value =>
                  handleInputChange('serviceTypeId', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a service type" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.length > 0 ? (
                    serviceTypes
                      .filter(st => st.id && st.id.trim() !== '')
                      .map(serviceType => (
                        <SelectItem key={serviceType.id} value={serviceType.id}>
                          {serviceType.name}
                        </SelectItem>
                      ))
                  ) : (
                    <SelectItem value="none">No service type</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <VideoUpload onVideoSelect={handleVideoSelect} className="w-full" />

        <Card>
          <CardHeader>
            <CardTitle>Thumbnail Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label size="default" className="mb-2 block">
                Upload Thumbnail (Optional)
              </Label>
              <p className="text-sm text-muted-foreground mb-4">
                Upload a thumbnail image for the video sample.
              </p>
              <ImageEditable
                className="mt-4 text-center"
                alt="Sample Thumbnail"
                onUpload={setThumbnailFile}
                aspectRatio={ASPECT_RATIOS.SQUARE}
                showCrop={true}
                size="small"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleBack}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !formData.videoUrl}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Creating...' : 'Create Sample'}
          </Button>
        </div>
      </form>
    </div>
  )
}
