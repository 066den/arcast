import ArticlesTable from '@/components/admin/ArticlesTable'
import { getArticles } from '@/services/blogServices'

export const dynamic = 'force-dynamic'
export default async function BlogPage() {
  const articles = await getArticles()
  return (
    <div className="p-4">
      <ArticlesTable initialData={articles} />
    </div>
  )
}
