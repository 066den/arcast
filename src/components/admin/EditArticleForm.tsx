'use client'

import { useState } from 'react'
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
import { BlogRecord } from '@/types'

interface EditArticleFormProps {
  article: BlogRecord
}

const EditArticleForm = ({ article }: EditArticleFormProps) => {
  const router = useRouter()
  const [imageFile, setImageFile] = useState<File | null>(null)

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<BlogRecordSchema>({
    resolver: zodResolver(blogRecordSchema),
    defaultValues: {
      title: article.title || '',
      tagline: article.tagline || '',
      mainText: article.mainText || '',
    },
  })

  const handleSave = handleSubmit(async (data: BlogRecordSchema) => {
    try {
      // Update the article
      await apiRequest(`${API_ENDPOINTS.BLOG}/${article.id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })

      // Upload new image if provided
      if (imageFile) {
        const formData = new FormData()
        formData.append('imageFile', imageFile)
        await apiRequest(`${API_ENDPOINTS.BLOG}/${article.id}/image`, {
          method: 'POST',
          body: formData,
        })
      }

      toast.success('Article updated successfully')
      router.push(ROUTES.ADMIN + ROUTES.BLOG)
    } catch (error) {
      
      toast.error('Error updating article')
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
        <h1 className="text-3xl font-bold">Edit Article</h1>
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

                <TaglineEditor
                  initialContent={article.tagline || ''}
                  onChange={handleTaglineChange}
                />

                <BlogEditor
                  initialContent={article.mainText || ''}
                  onChange={handleChange}
                />
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
                  className="mt-4"
                  alt="Article Image"
                  onUpload={setImageFile}
                  aspectRatio={ASPECT_RATIOS.CLASSIC}
                  src={article.mainImageUrl || undefined}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button type="submit" className="w-full gap-2">
                    <Save className="h-4 w-4" />
                    {isSubmitting ? 'Updating...' : 'Update Article'}
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

export default EditArticleForm
