import { Input } from '@/components/ui/input'
import { Modal } from '@/components/modals/modal'
import { StudioSchema, studioSchema } from '@/lib/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { TimePicker } from '@/components/ui/time-picker'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import ImageEditable from '@/components/ui/ImageEditable'
import { useState } from 'react'
import { ASPECT_RATIOS, ERROR_MESSAGES } from '@/lib/constants'
import { useStudios } from '@/hooks/storeHooks/useStudios'
import { toast } from 'sonner'
import { Preloader } from '@/components/ui/preloader'
import { cn } from '@/lib/utils'

interface AddStudioModalProps {
  isOpen: boolean
  onClose: () => void
}

const AddStudioModal = ({ isOpen, onClose }: AddStudioModalProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const { isLoading, createStudio } = useStudios()
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<StudioSchema>({
    resolver: zodResolver(studioSchema),
    mode: 'all',
    defaultValues: {
      name: '',
      location: 'Dubai',
      totalSeats: 4,
      openingTime: '10:00',
      closingTime: '21:00',
    },
  })

  const watchedOpeningTime = watch('openingTime')
  const watchedClosingTime = watch('closingTime')

  const onSubmit = handleSubmit(async (formData: StudioSchema) => {
    try {
      await createStudio({
        ...formData,
        imageFile,
      })
      onClose()
      reset()
      toast.success('Studio added successfully')
    } catch (error) {
      console.error(error)
      toast.error(ERROR_MESSAGES.STUDIO.FAILED_TO_CREATE_STUDIO)
    }
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Studio"
      description="Add a new studio to the database"
      size="lg"
    >
      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-full z-10 flex items-center justify-center p-4">
          <Preloader variant="wave" size="lg" text="Adding Studio..." />
        </div>
      )}
      <form
        onSubmit={onSubmit}
        className={cn(
          'relative flex flex-col gap-4 px-4 transition-opacity duration-300',
          isLoading && 'opacity-0'
        )}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            {...register('name')}
            placeholder="Studio Name"
            error={errors.name?.message}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="location">Location</Label>
          <Input
            {...register('location')}
            placeholder="Studio Location"
            error={errors.location?.message}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="totalSeats">Total Seats</Label>
          <Input
            type="number"
            {...register('totalSeats')}
            placeholder="Total Seats"
            error={errors.totalSeats?.message}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="openingTime">Opening Time</Label>
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
        </div>
        <ImageEditable
          className="mt-4 text-center"
          alt="Studio Image"
          onUpload={setImageFile}
          aspectRatio={ASPECT_RATIOS.CLASSIC}
        />
        <Button type="submit" size="lg" disabled={isLoading}>
          {isLoading ? 'Adding Studio...' : 'Add Studio'}
        </Button>
      </form>
    </Modal>
  )
}

export default AddStudioModal
