import { ERROR_MESSAGES } from '@/lib/constants'
import { prisma } from '@/lib/prisma'

export const getArticles = async () => {
  if (!prisma) {
    throw new Error(ERROR_MESSAGES.PRISMA.NOT_INITIALIZED)
  }
  try {
    const articles = await prisma.blogRecord.findMany()
    return articles
  } catch (error) {
    console.error('Error fetching articles:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to fetch articles: ${error.message}`)
    }
    throw new Error('Failed to fetch articles')
  }
}

export const getArticleById = async (id: string) => {
  if (!prisma) {
    throw new Error(ERROR_MESSAGES.PRISMA.NOT_INITIALIZED)
  }
  try {
    const article = await prisma.blogRecord.findUnique({ where: { id } })
    return article
  } catch (error) {
    console.error('Error fetching article by id:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to fetch article by id: ${error.message}`)
    }
    throw new Error('Failed to fetch article by id')
  }
}
