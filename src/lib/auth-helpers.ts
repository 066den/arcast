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
      console.log(`Admin not found or inactive: ${username}`)
      return null
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.passwordHash)

    if (!isValidPassword) {
      console.log(`Invalid password for admin: ${username}`)
      return null
    }

    // Update last login time
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    })

    console.log(`Successful login for admin: ${username}`)

    // Return user on successful authorization
    return {
      id: admin.id,
      name: admin.username,
      email: admin.email || 'admin@arcast.com',
      role: admin.role,
    }
  } catch (error) {
    console.error('Database connection or authorization error:', error)

    // If it's a connection error, we should handle it gracefully
    if (error instanceof Error && error.message.includes('connect')) {
      console.error('Database connection failed:', error.message)
    }

    return null
  } finally {
    // Ensure connection is closed
    try {
      await prisma.$disconnect()
    } catch (disconnectError) {
      console.error('Error disconnecting from database:', disconnectError)
    }
  }
}
