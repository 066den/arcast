#!/usr/bin/env node

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3')

async function testS3Config() {
  console.log('🔍 Testing S3/DigitalOcean Spaces configuration...\n')

  // Check environment variables
  const requiredEnvVars = [
    'AWS_REGION',
    'AWS_ENDPOINT',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_S3_BUCKET_NAME',
  ]

  console.log('📋 Environment Variables Check:')
  let allEnvVarsPresent = true

  requiredEnvVars.forEach(varName => {
    const value = process.env[varName]
    if (value) {
      console.log(`  ✅ ${varName}: ${varName.includes('KEY') ? '***' : value}`)
    } else {
      console.log(`  ❌ ${varName}: Not set`)
      allEnvVarsPresent = false
    }
  })

  if (!allEnvVarsPresent) {
    console.log('\n❌ Missing required environment variables!')
    console.log(
      'Please create a .env.local file with the required AWS/DigitalOcean Spaces credentials.'
    )
    console.log('See env.local.example for reference.')
    process.exit(1)
  }

  console.log('\n🔗 Testing S3 Connection...')

  try {
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      endpoint: process.env.AWS_ENDPOINT,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      forcePathStyle: false,
    })

    // Test connection by listing buckets
    const command = new ListBucketsCommand({})
    const response = await s3Client.send(command)

    console.log('✅ S3 Connection successful!')
    console.log(`📦 Available buckets: ${response.Buckets?.length || 0}`)

    if (response.Buckets) {
      response.Buckets.forEach(bucket => {
        const isTargetBucket = bucket.Name === process.env.AWS_S3_BUCKET_NAME
        console.log(
          `  ${isTargetBucket ? '🎯' : '  '} ${bucket.Name} ${isTargetBucket ? '(target bucket)' : ''}`
        )
      })
    }

    // Check if target bucket exists
    const targetBucket = process.env.AWS_S3_BUCKET_NAME
    const bucketExists = response.Buckets?.some(
      bucket => bucket.Name === targetBucket
    )

    if (bucketExists) {
      console.log(`\n✅ Target bucket "${targetBucket}" found!`)
      console.log('🎉 S3 configuration is ready for video uploads!')
    } else {
      console.log(`\n⚠️  Target bucket "${targetBucket}" not found!`)
      console.log(
        'Please create the bucket in your DigitalOcean Spaces dashboard.'
      )
    }
  } catch (error) {
    console.log('❌ S3 Connection failed!')
    console.log('Error details:', error.message)

    if (error.name === 'CredentialsProviderError') {
      console.log('\n💡 This usually means:')
      console.log('  - Invalid AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY')
      console.log("  - Credentials don't have proper permissions")
      console.log('  - Check your DigitalOcean Spaces API keys')
    } else if (error.name === 'NetworkingError') {
      console.log('\n💡 This usually means:')
      console.log('  - Invalid AWS_ENDPOINT URL')
      console.log('  - Network connectivity issues')
      console.log('  - Check your AWS_REGION setting')
    } else if (error.message.includes('Access Denied')) {
      console.log('\n💡 Access Denied usually means:')
      console.log('  - The Space "arcast-s3" does not exist')
      console.log('  - API keys do not have access to this Space')
      console.log('  - Space name is incorrect')
      console.log('\n🔧 Solutions:')
      console.log('  1. Create a new Space named "arcast-s3" in DigitalOcean')
      console.log('  2. Or change AWS_S3_BUCKET_NAME to an existing Space')
      console.log('  3. Check API key permissions in DigitalOcean')
    }

    process.exit(1)
  }
}

testS3Config()
