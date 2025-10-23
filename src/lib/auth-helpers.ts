import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function validateAdmin(username: string, password: string) {
  try {
    // Check database connection
    await prisma.$connect()

    const admin = await prisma.admin.findUnique({
      where: { username },
    })

    if (!admin || !admin.isActive) {
      return null
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.passwordHash)

    if (!isValidPassword) {
      return null
    }

    // Update last login time
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    })

    // Return user on successful authorization
    return {
      id: admin.id,
      name: admin.username,
      email: admin.email || 'admin@arcast.com',
      role: admin.role,
    }
  } catch (error) {
    // Only log critical errors
    if (error instanceof Error && !error.message.includes('connect')) {
      console.error('Authorization error:', error.message)
    }

    return null
  } finally {
    // Ensure connection is closed
    try {
      await prisma.$disconnect()
    } catch (disconnectError) {
      // Silent disconnect error handling
    }
  }
}
