#!/usr/bin/env node

const bcrypt = require('bcryptjs')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

console.log('=== Password Hash Generator for Arcast Admin ===\n')

rl.question('Enter password: ', password => {
  if (!password || password.length < 6) {
    console.error('\n❌ Password must be at least 6 characters')
    rl.close()
    process.exit(1)
  }

  const salt = bcrypt.genSaltSync(10)
  const hash = bcrypt.hashSync(password, salt)

  console.log('\n✅ Hash generated successfully!')
  console.log('\nAdd the following line to your .env.local file:\n')
  console.log(`ADMIN_PASSWORD_HASH=${hash}`)
  console.log('\n')

  rl.close()
})
