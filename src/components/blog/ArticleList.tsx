'use client'
import { BlogRecord } from '@/types'
import Headline from '../common/Headline'
import { useRouter } from 'next/navigation'

const ArticleList = ({ articles }: { articles: BlogRecord[] }) => {
  const router = useRouter()
  return (
    <section className="lg:py-14 py-6">
      {articles.map(({ id, title, tagline, mainImageUrl }) => (
        <div key={id} className="lg:mb-10 mb-4">
          <Headline
            title={title!}
            description={tagline!}
            image={mainImageUrl || '/assets/images/poster-blog.webp'}
            actionSection={[
              {
                label: 'Read More',
                event: () => {
                  router.push(`/blog/${id}`)
                },
              },
            ]}
          />
        </div>
      ))}
    </section>
  )
}

export default ArticleList
