import HeroSection from '@/components/sections/HeroSection'
import { getArticleById } from '@/services/blogServices'
import { redirect } from 'next/navigation'
import { stripHtml } from '@/utils/renderText'
import ReactHtmlParser from 'html-react-parser'

const BlogPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const article = await getArticleById(id)
  if (!article) {
    redirect('/blog')
  }
  const { title, tagline, mainImageUrl, mainText } = article

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
    </>
  )
}

export default BlogPage
