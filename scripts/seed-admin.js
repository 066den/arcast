#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function resolvePasswordHash() {
  // Prefer explicit hash if provided
  const hash = process.env.ADMIN_PASSWORD_HASH
  const plainFromAdmin = process.env.ADMIN_PASSWORD
  const plainFromSeed = process.env.SEED_ADMIN_PASSWORD

  if (hash && hash.startsWith('$2')) {
    return { hash, source: 'ADMIN_PASSWORD_HASH' }
  }
  const plain = plainFromAdmin || plainFromSeed
  if (plain) {
    const hash = await bcrypt.hash(plain, 10)
    return { hash, source: plainFromAdmin ? 'ADMIN_PASSWORD' : 'SEED_ADMIN_PASSWORD' }
  }
  return { hash: null, source: null }
}

async function seedAdmin() {
  try {
    console.log('🌱 Seeding admin user (idempotent)...\n')

    const username = (process.env.ADMIN_USERNAME || 'admin').trim()
    const email = (process.env.ADMIN_EMAIL || 'admin@arcast.com').trim()
    const role = process.env.ADMIN_ROLE || 'admin'
    const isActive = String(process.env.ADMIN_IS_ACTIVE || 'true') === 'true'
    const updateIfExists =
      String(process.env.ADMIN_UPDATE_PASSWORD_IF_EXISTS || 'false') === 'true'

    const { hash: desiredHash, source } = await resolvePasswordHash()

    const existingAdmin = await prisma.admin.findUnique({
      where: { username },
      select: { id: true, username: true, email: true },
    })

    if (existingAdmin) {
      console.log(`ℹ️  Admin '${existingAdmin.username}' already exists.`)
      if (updateIfExists && desiredHash) {
        await prisma.admin.update({
          where: { id: existingAdmin.id },
          data: { passwordHash: desiredHash, email, role, isActive },
        })
        console.log(
          `🔄 Password updated for '${existingAdmin.username}' using ${source}.`
        )
      } else {
        console.log(
          updateIfExists
            ? '⚠️  ADMIN_UPDATE_PASSWORD_IF_EXISTS=true, but no password provided via env; skip update.'
            : '➡️  To update password on existing admin, set ADMIN_UPDATE_PASSWORD_IF_EXISTS=true and provide ADMIN_PASSWORD or ADMIN_PASSWORD_HASH.'
        )
      }
      console.log('\nDone.\n')
      return
    }

    if (!desiredHash) {
      console.error(
        '❌ No admin password provided. Set ADMIN_PASSWORD or ADMIN_PASSWORD_HASH.'
      )
      process.exit(1)
    }

    const admin = await prisma.admin.create({
      data: {
        username,
        passwordHash: desiredHash,
        email,
        role,
        isActive,
      },
    })

    console.log('✅ Admin user created successfully!\n')
    console.log('Credentials:')
    console.log(`   Username: ${admin.username}`)
    console.log(`   Email: ${admin.email}`)
    console.log('   Password: [set from env]')
    console.log('\n⚠️  Please change the password after first login!\n')
  } catch (error) {
    console.error('❌ Error seeding admin:', error?.message || error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seedAdmin()
