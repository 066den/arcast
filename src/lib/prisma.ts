import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const prismaClientSingleton = () =>
  new PrismaClient().$extends(withAccelerate())

export const prisma = globalThis.prisma || prismaClientSingleton()

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}
