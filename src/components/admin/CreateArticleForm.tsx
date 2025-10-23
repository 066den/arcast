'use client'
import { useRouter } from 'next/navigation'
import { API_ENDPOINTS, ASPECT_RATIOS, ROUTES } from '@/lib/constants'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { blogRecordSchema, BlogRecordSchema } from '@/lib/schemas'
import { Button } from '../ui/button'
import { ArrowLeft, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { BlogEditor } from './BlogEditor'
import { TaglineEditor } from './TaglineEditor'
import { apiRequest } from '@/lib/api'
import { toast } from 'sonner'
import ImageEditable from '../ui/ImageEditable'
import { useState } from 'react'
import { BlogRecord } from '@/types'

const CreateArticleForm = () => {
  const router = useRouter()
  const [imageFile, setImageFile] = useState<File | null>(null)

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BlogRecordSchema>({
    resolver: zodResolver(blogRecordSchema),
    defaultValues: {
      title: '',
      tagline: '',
      mainText: '',
    },
  })

  const handleSave = handleSubmit(async (data: BlogRecordSchema) => {
    try {
      const article = await apiRequest<BlogRecord>(API_ENDPOINTS.BLOG, {
        method: 'POST',
        body: JSON.stringify(data),
      })
      if (article && imageFile) {
        const formData = new FormData()
        formData.append('imageFile', imageFile)
        await apiRequest(`${API_ENDPOINTS.BLOG}/${article?.id}/image`, {
          method: 'POST',
          body: formData,
        })
      }
      toast.success('Article created successfully')
      //router.push(ROUTES.ADMIN + ROUTES.BLOG)
    } catch (error) {
      console.error('Error creating article:', error)
    }
  })

  const handleBack = () => {
    router.push(ROUTES.ADMIN + ROUTES.BLOG)
  }

  const handleChange = (content: string) => {
    setValue('mainText', content)
  }

  const handleTaglineChange = (content: string) => {
    setValue('tagline', content)
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Articles
        </Button>
        <h1 className="text-3xl font-bold">Create New Article</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    error={errors.title?.message}
                  />
                </div>

                <TaglineEditor onChange={handleTaglineChange} />

                <BlogEditor onChange={handleChange} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Featured Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ImageEditable
                  className="mt-4 text-center"
                  alt="Studio Image"
                  onUpload={setImageFile}
                  aspectRatio={ASPECT_RATIOS.CLASSIC}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button type="submit" className="w-full gap-2">
                    <Save className="h-4 w-4" />
                    {isSubmitting ? 'Creating...' : 'Create Article'}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleBack}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}

export default CreateArticleForm
