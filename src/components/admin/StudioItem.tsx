'use client'
import { useState } from 'react'
import { Studio } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Clock, Edit, MapPin, Save, Users } from 'lucide-react'
import { X } from 'lucide-react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { TimePicker } from '../ui/time-picker'
import { zodResolver } from '@hookform/resolvers/zod'
import { StudioSchema, studioSchema } from '@/lib/schemas'
import { useForm } from 'react-hook-form'
import ImageEditable from '../ui/ImageEditable'
import { ASPECT_RATIOS } from '@/lib/constants'

const StudioItem = ({ studio }: { studio: Studio }) => {
  const [isEditing, setIsEditing] = useState(false)
  const { name, openingTime, closingTime, totalSeats, location, imageUrl } =
    studio

  const { register, watch, setValue } = useForm<StudioSchema>({
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

  const handleSave = () => {
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleUploadImage = async (file: File) => {
    try {
      // Here you can add server upload logic
      console.log('Cropped file:', file)
      // For example, send to API:
      // const formData = new FormData()
      // formData.append('image', file)
      // await fetch('/api/studios/image', { method: 'POST', body: formData })
    } catch (error) {
      console.error('Error uploading image:', error)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between">
        <CardTitle>
          {isEditing ? <Input {...register('name')} /> : name}
        </CardTitle>
        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
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
                <p className="text-sm text-muted-foreground">Location:</p>
                {isEditing ? (
                  <Input
                    {...register('location')}
                    placeholder="Location"
                    className="flex-1"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{location}</span>
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
                <p className="text-sm text-muted-foreground">Total Seats:</p>
                {isEditing ? (
                  <Input
                    type="number"
                    {...register('totalSeats')}
                    placeholder="Total Seats"
                    className="flex-1"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{totalSeats}</span>
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
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Opening Time:
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
        <ImageEditable
          className="mt-4"
          src={imageUrl || undefined}
          alt="Studio Image"
          onUpload={handleUploadImage}
          aspectRatio={ASPECT_RATIOS.LANDSCAPE}
        />
      </CardContent>
    </Card>
  )
}

export default StudioItem
