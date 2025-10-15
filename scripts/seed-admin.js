#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function seedAdmin() {
  try {
    console.log('🌱 Seeding admin user...\n')

    const username = process.env.ADMIN_USERNAME || 'admin'
    const password = process.env.SEED_ADMIN_PASSWORD || 'admin123'

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { username },
    })

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists')
      console.log(`   Username: ${existingAdmin.username}`)
      console.log(`   Created: ${existingAdmin.createdAt}`)
      console.log('\nTo reset password, use: npm run admin:reset-password\n')
      return
    }

    // Create password hash
    const passwordHash = await bcrypt.hash(password, 10)

    // Create admin user
    const admin = await prisma.admin.create({
      data: {
        username,
        passwordHash,
        email: 'admin@arcast.com',
        role: 'admin',
        isActive: true,
      },
    })

    console.log('✅ Admin user created successfully!\n')
    console.log('Login credentials:')
    console.log(`   Username: ${admin.username}`)
    console.log(`   Password: ${password}`)
    console.log(`   Email: ${admin.email}`)
    console.log('\n⚠️  Please change the password after first login!\n')
  } catch (error) {
    console.error('❌ Error seeding admin:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seedAdmin()
