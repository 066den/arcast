import { NextResponse } from 'next/server'
import { s3Client, BUCKET_NAME } from '@/lib/s3'
import { ListObjectsV2Command } from '@aws-sdk/client-s3'

export async function GET() {
  try {
    console.log('🔍 Testing S3/DigitalOcean Spaces connection...')

    // Test connection by listing objects in the bucket
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      MaxKeys: 10,
    })

    const response = await s3Client.send(command)

    console.log('✅ S3 Connection successful!')
    console.log(`📦 Objects in bucket: ${response.Contents?.length || 0}`)

    const files =
      response.Contents?.map(obj => ({
        key: obj.Key,
        size: obj.Size,
        lastModified: obj.LastModified,
      })) || []

    return NextResponse.json({
      success: true,
      message: 'S3 connection successful',
      bucket: BUCKET_NAME,
      objectCount: response.Contents?.length || 0,
      files: files,
      bucketUrl: `https://${BUCKET_NAME}.blr1.digitaloceanspaces.com`,
      cdnUrl: `https://${BUCKET_NAME}.blr1.cdn.digitaloceanspaces.com`,
    })
  } catch (error) {
    console.error('❌ S3 Connection failed:', error)

    let errorMessage = 'Unknown error'
    let errorCode = 'UNKNOWN_ERROR'

    if (error instanceof Error) {
      errorMessage = error.message
      errorCode = error.name
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        errorCode: errorCode,
        bucket: BUCKET_NAME,
        endpoint: 'https://blr1.digitaloceanspaces.com',
      },
      { status: 500 }
    )
  }
}
