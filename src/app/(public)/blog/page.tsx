import HeroSection from '@/components/sections/HeroSection'
import { getArticles } from '@/services/blogServices'
import ArticleList from '@/components/blog/ArticleList'

export default async function BlogPage() {
  const articles = await getArticles()
  return (
    <>
      <HeroSection
        title="Blog"
        description="Learn best media content production practices "
        image="/assets/images/blog-banner.webp"
      />
      <ArticleList articles={articles} />
    </>
  )
}
