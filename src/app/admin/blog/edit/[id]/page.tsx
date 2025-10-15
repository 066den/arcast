'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import EditArticleForm from '@/components/admin/EditArticleForm'
import { toast } from 'sonner'
import { Preloader } from '@/components/ui/preloader'
import { BlogRecord } from '@/types'

interface EditArticlePageProps {
  params: Promise<{ id: string }>
}

export default function EditArticlePage({ params }: EditArticlePageProps) {
  const router = useRouter()
  const [article, setArticle] = useState<BlogRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Unwrap the params promise using React.use()
  const resolvedParams = use(params)

  useEffect(() => {
    fetchArticle()
  }, [resolvedParams.id])

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/blog/${resolvedParams.id}`)
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Article not found')
          router.push('/admin/blog')
          return
        }
        throw new Error('Failed to fetch article')
      }
      const data = await response.json()
      setArticle(data)
    } catch (error) {
      console.error('Error fetching article:', error)
      toast.error('Error loading article')
      router.push('/admin/blog')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-64">
          <Preloader variant="spinner" size="xl" text="Loading..." />
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Article not found</p>
        </div>
      </div>
    )
  }

  return <EditArticleForm article={article} />
}
