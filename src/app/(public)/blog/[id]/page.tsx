import HeroSection from '@/components/sections/HeroSection'
import { getArticleById } from '@/services/blogServices'
import { redirect } from 'next/navigation'
import { stripHtml } from '@/utils/renderText'
import ReactHtmlParser from 'html-react-parser'
import PackagesSection from '@/components/sections/PackagesSection'
import { getPackages, getServiceTypes } from '@/services/servicesServices'

const BlogPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const article = await getArticleById(id)
  if (!article) {
    redirect('/blog')
  }
  const { title, tagline, mainImageUrl, mainText } = article
  const [initialServiceTypes, initialPackages] = await Promise.all([
    getServiceTypes(),
    getPackages(),
  ])

  return (
    <>
      <HeroSection
        title={title}
        description={stripHtml(tagline)}
        image={mainImageUrl ?? '/assets/images/blog-banner.webp'}
      />
      <section className="py-14">
        <div className="text-content blog-text-content">
          {ReactHtmlParser(mainText)}
        </div>
      </section>
      <PackagesSection
        initialServiceTypes={initialServiceTypes}
        initialPackages={initialPackages}
      />
    </>
  )
}

export default BlogPage
