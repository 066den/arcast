import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const prismaClientSingleton = () => {
  const client = new PrismaClient({
    log: ['error'],
    errorFormat: 'pretty',
  })
  // Применяем accelerate только если есть URL для него
  if (process.env.DATABASE_URL?.includes('prisma.io')) {
    return client.$extends(withAccelerate())
  }
  return client
}

type PrismaClientType = ReturnType<typeof prismaClientSingleton>

export const prisma = (globalThis.prisma ||
  prismaClientSingleton()) as unknown as PrismaClient

declare global {
  var prisma: undefined | PrismaClientType
}

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}
