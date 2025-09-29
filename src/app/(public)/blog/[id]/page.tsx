import { getArticleById } from '@/services/blogServices'

const BlogPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const article = await getArticleById(id)
  return <div>{article?.title}</div>
}

export default BlogPage
