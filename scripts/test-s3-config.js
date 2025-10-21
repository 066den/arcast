#!/usr/bin/env node

/**
 * AWS S3 / DigitalOcean Spaces Configuration Test Script
 *
 * This script tests the connection to DigitalOcean Spaces
 * and verifies that the configuration is working correctly.
 *
 * Usage: node scripts/test-s3-config.js
 */

const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3')
const path = require('path')
const fs = require('fs')

// Load environment variables from .env.local if it exists
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, '')
        process.env[key.trim()] = value.trim()
      }
    })
  }
}

async function testS3Configuration() {
  console.log('🔧 Testing AWS S3 / DigitalOcean Spaces Configuration...\n')

  // Load environment variables
  loadEnvFile()

  // Check environment variables
  const requiredEnvVars = [
    'AWS_REGION',
    'AWS_ENDPOINT',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_S3_BUCKET_NAME',
  ]

  console.log('📋 Checking environment variables:')
  const missingVars = []

  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      console.log(`  ✅ ${envVar}: Set`)
    } else {
      console.log(`  ❌ ${envVar}: Missing`)
      missingVars.push(envVar)
    }
  }

  if (missingVars.length > 0) {
    console.log('\n❌ Missing required environment variables:')
    missingVars.forEach(varName => console.log(`  - ${varName}`))
    console.log('\nPlease set these variables in your .env.local file')
    console.log('Example:')
    console.log('AWS_REGION="blr1"')
    console.log('AWS_ENDPOINT="https://blr1.digitaloceanspaces.com"')
    console.log('AWS_ACCESS_KEY_ID="your-access-key"')
    console.log('AWS_SECRET_ACCESS_KEY="your-secret-key"')
    console.log('AWS_S3_BUCKET_NAME="arcast-s3"')
    process.exit(1)
  }

  console.log('\n🔗 Testing S3 connection...')
  console.log(`Using region: ${process.env.AWS_REGION}`)
  console.log(`Using endpoint: ${process.env.AWS_ENDPOINT}`)
  console.log(`Using bucket: ${process.env.AWS_S3_BUCKET_NAME}`)

  try {
    // Create S3 client
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      endpoint: process.env.AWS_ENDPOINT,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      forcePathStyle: false,
    })

    // Test connection by listing objects
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      MaxKeys: 1, // Only get 1 object to test connection
    })

    const response = await s3Client.send(command)

    console.log('✅ Successfully connected to DigitalOcean Spaces!')
    console.log(`📦 Bucket: ${process.env.AWS_S3_BUCKET_NAME}`)
    console.log(`🌍 Region: ${process.env.AWS_REGION}`)
    console.log(`🔗 Endpoint: ${process.env.AWS_ENDPOINT}`)

    if (response.Contents && response.Contents.length > 0) {
      console.log(`📁 Found ${response.KeyCount || 0} objects in bucket`)
    } else {
      console.log('📁 Bucket is empty (this is normal for new spaces)')
    }

    console.log('\n🎉 Configuration test completed successfully!')
    console.log('Your AWS S3 / DigitalOcean Spaces setup is ready to use.')
  } catch (error) {
    console.log('\n❌ Failed to connect to DigitalOcean Spaces:')
    console.error(error.message || error)

    console.log('\n🔍 Troubleshooting tips:')
    console.log('1. Verify your AWS credentials are correct')
    console.log('2. Check that your bucket name matches exactly')
    console.log('3. Ensure your DigitalOcean Space is in the correct region')
    console.log('4. Verify your endpoint URL is correct')
    console.log('5. Make sure your DigitalOcean Space exists and is accessible')

    process.exit(1)
  }
}

// Run the test
testS3Configuration().catch(console.error)
