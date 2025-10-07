'use client'
import { useState } from 'react'
import { Studio } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import { Clock, Edit, MapPin, Save, Users } from 'lucide-react'
import { X } from 'lucide-react'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { TimePicker } from '../../ui/time-picker'
import { zodResolver } from '@hookform/resolvers/zod'
import { StudioSchema, studioSchema } from '@/lib/schemas'
import { useForm } from 'react-hook-form'
import ImageEditable from '../../ui/ImageEditable'
import { ASPECT_RATIOS } from '@/lib/constants'
import { useStudios } from '@/hooks/storeHooks/useStudios'
import { toast } from 'sonner'
import { ApiError } from '@/lib/api'
import GalleryEditable from '@/components/ui/GalleryEditable'

const StudioItem = ({ studio }: { studio: Studio }) => {
  const [isEditing, setIsEditing] = useState(false)
  const {
    updateStudioImage,
    updateStudio,
    updateStudioGallery,
    deleteStudioGallery,
  } = useStudios()
  const {
    name,
    openingTime,
    closingTime,
    totalSeats,
    location,
    imageUrl,
    gallery,
  } = studio

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { isValid },
  } = useForm<StudioSchema>({
    resolver: zodResolver(studioSchema),
    defaultValues: {
      name,
      openingTime,
      closingTime,
      totalSeats,
      location,
    },
  })

  const watchedOpeningTime = watch('openingTime')
  const watchedClosingTime = watch('closingTime')

  const handleSave = handleSubmit(async (data: StudioSchema) => {
    setIsEditing(false)
    try {
      await updateStudio(studio.id, data)
      toast.success('Studio updated successfully')
    } catch (error) {
      console.error('Error updating studio:', error)
      toast.error('Error updating studio')
    }
  })

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleUploadImage = async (file: File) => {
    try {
      await updateStudioImage(studio.id, file)
      toast.success('Image uploaded successfully')
    } catch (error) {
      console.error('Error uploading image:', error)

      toast.error(
        error instanceof ApiError ? error.message : 'Error uploading image'
      )
    }
  }

  const handleUploadGallery = async (file: File) => {
    try {
      await updateStudioGallery(studio.id, file)
      toast.success('Gallery uploaded successfully')
    } catch (error) {
      console.error('Error uploading gallery:', error)
      toast.error('Error uploading gallery')
    }
  }

  const handleDeleteGallery = async (image: string) => {
    try {
      await deleteStudioGallery(studio.id, image)
      toast.success('Gallery deleted successfully')
    } catch (error) {
      console.error('Error deleting gallery:', error)
      toast.error('Error deleting gallery')
    }
  }

  return (
    <form onSubmit={handleSave}>
      <Card>
        <CardHeader className="flex flex-row justify-between">
          <CardTitle>
            {isEditing ? (
              <Input {...register('name')} className="flex-1" />
            ) : (
              name
            )}
          </CardTitle>
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <span className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </span>
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                type="submit"
                disabled={!isValid}
              >
                <span className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </span>
              </Button>
              <Button
                variant="ghost"
                type="button"
                size="sm"
                onClick={handleCancel}
              >
                <span className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </span>
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {/* grid-cols-[repeat(auto-fit,minmax(325px,1fr))] */}
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <div className="flex items-center bg-muted/30 rounded-lg px-4 py-2 h-full">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-base text-muted-foreground">Location:</p>
                  {isEditing ? (
                    <Input
                      {...register('location')}
                      placeholder="Location"
                      className="flex-1"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-base">{location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center bg-muted/30 rounded-lg px-4 py-2 h-full">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-base text-muted-foreground">
                    Total Seats:
                  </p>
                  {isEditing ? (
                    <Input
                      type="number"
                      {...register('totalSeats', {
                        valueAsNumber: true,
                      })}
                      placeholder="Total Seats"
                      className="flex-1"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-base">{totalSeats}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center bg-muted/30 rounded-lg py-2 px-4 col-span-1 lg:col-span-2">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="flex items-center gap-2">
                  <Label>
                    <span className="text-base">Opening Time:</span>
                  </Label>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <TimePicker
                        value={watchedOpeningTime}
                        onChange={time => setValue('openingTime', time)}
                      />
                      {'-'}
                      <TimePicker
                        value={watchedClosingTime}
                        onChange={time => setValue('closingTime', time)}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {openingTime} - {closingTime}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <ImageEditable
              src={imageUrl || undefined}
              alt="Studio Image"
              onUpload={handleUploadImage}
              aspectRatio={ASPECT_RATIOS.CLASSIC}
            />

            <GalleryEditable
              onUpload={handleUploadGallery}
              aspectRatio={ASPECT_RATIOS.LANDSCAPE}
              images={gallery}
              onDelete={handleDeleteGallery}
            />
          </div>
        </CardContent>
      </Card>
    </form>
  )
}

export default StudioItem
