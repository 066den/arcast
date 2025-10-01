import HeroSection from '@/components/sections/HeroSection'
import { getArticles } from '@/services/blogServices'
import ArticleList from '@/components/blog/ArticleList'
import PackagesSection from '@/components/sections/PackagesSection'
import { getPackages, getServiceTypes } from '@/services/servicesServices'

export default async function BlogPage() {
  const articles = await getArticles()
  const [initialServiceTypes, initialPackages] = await Promise.all([
    getServiceTypes(),
    getPackages(),
  ])
  return (
    <>
      <HeroSection
        title="Blog"
        description="Learn best media content production practices "
        image="/assets/images/blog-banner.webp"
      />
      <ArticleList articles={articles} />
      <PackagesSection
        initialServiceTypes={initialServiceTypes}
        initialPackages={initialPackages}
      />
    </>
  )
}
