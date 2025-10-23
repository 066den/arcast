import { prisma } from '@/lib/prisma'

export async function fetchClients() {
  const clients = await prisma.client.findMany({ orderBy: { name: 'asc' } })
  return clients
}
