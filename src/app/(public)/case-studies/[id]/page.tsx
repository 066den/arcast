import HeroSection from '@/components/sections/HeroSection'
import { getCaseById, getCases } from '@/services/studioServices'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'
import { CaseStudyEquipment, CaseStudyStaff } from '@/types'
import ItemCard from '@/components/common/ItemCard'

export async function generateStaticParams() {
  const cases = await getCases()
  return cases.map(caseStudy => ({
    id: caseStudy.id,
  }))
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const caseStudy = await getCaseById(id)
  if (!caseStudy) {
    redirect('/case-studies')
  }
  const { title, tagline, mainText, caseContent, equipment, staff } = caseStudy

  return (
    <>
      <HeroSection
        title={title}
        description={tagline}
        image="/assets/images/case-banner.jpg"
      />
      <section className="py-24">
        <h3 className="text-accent">{mainText}</h3>
      </section>
      <section className="py-16 space-y-24">
        {caseContent?.map((item, index) => (
          <div key={item.id}>
            <h2 className="text-accent mb-6">{item.title}</h2>
            <div
              className={cn('flex gap-10', {
                'lg:flex-row-reverse': index % 2 === 1 && item.imageUrl,
              })}
            >
              {item.imageUrl && (
                <div className="aspect-[5/4] w-full max-w-[426px] overflow-hidden rounded-[2.5rem] relative">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              {item.text && item.text.length > 0 && (
                <div className="text-content text-3xl font-nunito-sans leading-normal">
                  {item.text.map((textItem: string, textIndex: number) => (
                    <ReactMarkdown key={textIndex}>{textItem}</ReactMarkdown>
                  ))}
                </div>
              )}

              {item.list && item.list.length > 0 && (
                <ul className="space-y-6">
                  {item.list.map((listItem: string, listIndex: number) => (
                    <li key={listIndex} className="flex items-start">
                      <span className="mr-5 mt-0.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="27"
                          height="40"
                          fill="none"
                          viewBox="0 0 27 40"
                        >
                          <path
                            fill="#FF8C42"
                            d="M25.086 0c-.825 0-1.512 6.82-1.673 15.892-.17-8.324-.851-14.546-1.669-14.546-.825 0-1.512 6.365-1.673 14.83-.17-7.717-.85-13.486-1.666-13.486-.825 0-1.514 5.91-1.673 13.77-.172-7.11-.854-12.424-1.666-12.424-.825 0-1.514 5.455-1.673 12.707-.172-6.503-.854-11.361-1.666-11.361-.825 0-1.515 5-1.674 11.647C9.882 11.134 9.2 6.728 8.388 6.728c-.828 0-1.517 4.551-1.674 10.592-.171-5.292-.853-9.246-1.666-9.246-.827 0-1.517 4.097-1.673 9.534-.172-4.686-.853-8.188-1.666-8.188C.766 9.42 0 14.132 0 19.948c0 5.816.764 10.529 1.71 10.529.812 0 1.49-3.5 1.665-8.19.156 5.439.846 9.536 1.673 9.536.813 0 1.495-3.954 1.666-9.247.157 6.044.849 10.593 1.674 10.593.815 0 1.494-4.404 1.665-10.301.16 6.646.849 11.647 1.674 11.647.815 0 1.494-4.858 1.666-11.361.159 7.251.848 12.707 1.673 12.707.815 0 1.497-5.313 1.666-12.424.159 7.86.848 13.77 1.673 13.77.815 0 1.497-5.768 1.666-13.486.159 8.464.848 14.83 1.673 14.83.815 0 1.497-6.225 1.669-14.547.161 9.073.848 15.892 1.673 15.892.943 0 1.71-8.932 1.71-19.95C26.796 8.926 26.029 0 25.085 0Z"
                          />
                        </svg>
                      </span>
                      <span className="text-3xl font-nunito-sans leading-normal">
                        {listItem}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </section>

      {staff && staff.length > 0 && (
        <section className="py-16">
          <h2 className="text-accent mb-6">This case talent support team</h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {staff?.map(({ id, name, role, imageUrl }: CaseStudyStaff) => (
              <ItemCard
                key={id}
                name={name}
                description={role}
                imageUrl={imageUrl}
              />
            ))}
          </div>
        </section>
      )}

      {equipment && equipment.length > 0 && (
        <section className="py-16">
          <h2 className="text-accent mb-6">Equipment used in this case</h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {equipment?.map(
              ({ id, name, description, imageUrl }: CaseStudyEquipment) => (
                <ItemCard
                  key={id}
                  name={name}
                  description={description}
                  imageUrl={imageUrl}
                />
              )
            )}
          </div>
        </section>
      )}
    </>
  )
}
