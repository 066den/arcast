import { prisma } from '@/lib/prisma'
import { DiscountCode } from '@/types/admin'

export async function fetchDiscountCodes(): Promise<DiscountCode[]> {
  const codes = await prisma.discountCode.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return codes.map(c => ({
    ...c,
    value: Number(c.value),
    minOrderAmount: c.minOrderAmount ? Number(c.minOrderAmount) : null,
  }))
}

export async function createDiscountCode(data: Omit<DiscountCode, 'id'>) {
  return await prisma.discountCode.create({
    data: {
      ...data,
      value: data.value.toString(),
      minOrderAmount: data.minOrderAmount?.toString() || null,
      type: data.type as any,
    },
  })
}

export async function updateDiscountCode(
  id: string,
  data: Partial<DiscountCode>
) {
  return await prisma.discountCode.update({
    where: { id },
    data: {
      ...data,
      value: data.value?.toString(),
      minOrderAmount: data.minOrderAmount?.toString() || null,
      type: data.type as any,
    },
  })
}

export async function deleteDiscountCode(id: string) {
  return await prisma.discountCode.delete({
    where: { id },
  })
}
