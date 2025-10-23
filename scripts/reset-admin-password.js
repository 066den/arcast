#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const readline = require('readline')

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve)
  })
}

async function resetPassword() {
  try {
    console.log('🔐 Admin Password Reset Tool\n')

    // Get list of admins
    const admins = await prisma.admin.findMany({
      select: { id: true, username: true, email: true },
    })

    if (admins.length === 0) {
      console.log('❌ No admin users found. Run: npm run admin:seed\n')
      process.exit(1)
    }

    console.log('Available admins:')
    admins.forEach((admin, index) => {
      console.log(
        `${index + 1}. ${admin.username} (${admin.email || 'no email'})`
      )
    })
    console.log()

    const username = await question('Enter username: ')
    const admin = admins.find(a => a.username === username)

    if (!admin) {
      console.log('❌ Admin not found\n')
      process.exit(1)
    }

    const newPassword = await question(
      'Enter new password (min 6 characters): '
    )

    if (newPassword.length < 6) {
      console.log('❌ Password must be at least 6 characters\n')
      process.exit(1)
    }

    const confirm = await question('Confirm password: ')

    if (newPassword !== confirm) {
      console.log('❌ Passwords do not match\n')
      process.exit(1)
    }

    // Update password
    const passwordHash = await bcrypt.hash(newPassword, 10)
    await prisma.admin.update({
      where: { id: admin.id },
      data: { passwordHash },
    })

    console.log('\n✅ Password reset successfully!')
    console.log(`   Username: ${admin.username}`)
    console.log('   You can now login with the new password\n')
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    rl.close()
    await prisma.$disconnect()
  }
}

resetPassword()
