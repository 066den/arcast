'use client'
import { BlogRecord } from '@/types'
import Headline from '../common/Headline'
import { useRouter } from 'next/navigation'

const ArticleList = ({ articles }: { articles: BlogRecord[] }) => {
  const router = useRouter()
  return (
    <section className="py-14">
      {articles.map(({ id, title, tagline, mainImageUrl }) => (
        <div key={id} className="mb-10">
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
