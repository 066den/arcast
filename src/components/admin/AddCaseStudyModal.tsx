'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Modal } from '@/components/modals/modal'
import { createCaseStudy } from '@/lib/api'
import { toast } from 'sonner'
import { Preloader } from '@/components/ui/preloader'
import { ApiError } from '@/lib/api'
import { cn } from '@/lib/utils'

interface AddCaseStudyModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AddCaseStudyModal({
  isOpen,
  onClose,
  onSuccess,
}: AddCaseStudyModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    mainText: '',
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
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
      await createCaseStudy({
        title: formData.title,
        tagline: formData.tagline,
        mainText: formData.mainText,
        clientId: null,
        staffIds: [],
        equipmentIds: [],
        imageUrls: [],
        caseContent: [],
      })

      toast.success('Case study created successfully')
      onSuccess()
      onClose()
      setFormData({
        title: '',
        tagline: '',
        mainText: '',
      })
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Case Study"
      description="Create a new case study"
      size="lg"
      className="pb-8 scrollbar-gutter-stable"
    >
      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-full z-10 flex items-center justify-center p-4">
          <Preloader variant="wave" size="lg" text="Creating case study..." />
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className={cn(
          'relative flex flex-col gap-4 px-4 transition-opacity duration-300',
          isLoading && 'opacity-0'
        )}
      >
        <div className="flex flex-col gap-2">
          <Label size="lg" htmlFor="title">
            Title *
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={e => handleInputChange('title', e.target.value)}
            placeholder="Enter case study title"
            disabled={isLoading}
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

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Case Study'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
