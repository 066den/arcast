import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// AWS S3 Configuration for DigitalOcean Spaces
const s3Client = new S3Client({
  region: 'blr1',
  endpoint: 'https://blr1.digitaloceanspaces.com',
  credentials: {
    accessKeyId: 'DO801ZANC8M4JR4ANL7Z',
    secretAccessKey: 'R1umCcwzZQtooGLR1eccRTNh0KBVqrptLZVpWlEmZEo',
  },
  forcePathStyle: false, // DigitalOcean Spaces uses virtual-hosted-style URLs
})

const BUCKET_NAME = 'arcast-s3'

export interface UploadResult {
  url: string
  cdnUrl: string
  key: string
  bucket: string
}

export interface UploadOptions {
  folder?: string
  contentType?: string
  metadata?: Record<string, string>
}

/**
 * Get CDN URL for a file (if CDN is enabled)
 */
export const getCdnUrl = (fileKey: string): string => {
  return `https://${BUCKET_NAME}.blr1.cdn.digitaloceanspaces.com/${fileKey}`
}

/**
 * Upload a file to S3 (DigitalOcean Spaces)
 */
export const uploadToS3 = async (
  file: File | Buffer,
  fileName: string,
  options: UploadOptions = {}
): Promise<UploadResult> => {
  try {
    const { folder = 'uploads', contentType, metadata = {} } = options

    // Generate unique file key
    const fileKey = folder ? `${folder}/${fileName}` : fileName

    // Prepare file buffer
    let fileBuffer: Buffer
    let fileContentType = contentType

    if (file instanceof File) {
      fileBuffer = Buffer.from(await file.arrayBuffer())
      fileContentType = fileContentType || file.type
    } else {
      fileBuffer = file
    }

    // Upload parameters
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: fileContentType,
      Metadata: metadata,
      ACL: 'public-read' as const, // Make files publicly accessible
    }

    const command = new PutObjectCommand(uploadParams)
    await s3Client.send(command)

    // Return the public URL and CDN URL
    const publicUrl = `https://${BUCKET_NAME}.blr1.digitaloceanspaces.com/${fileKey}`
    const cdnUrl = `https://${BUCKET_NAME}.blr1.cdn.digitaloceanspaces.com/${fileKey}`

    return {
      url: publicUrl,
      cdnUrl: cdnUrl,
      key: fileKey,
      bucket: BUCKET_NAME,
    }
  } catch (error) {
    console.error('Error uploading to S3:', error)
    throw new Error('Failed to upload file to S3')
  }
}

/**
 * Delete a file from S3
 */
export const deleteFromS3 = async (fileKey: string): Promise<boolean> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    })

    await s3Client.send(command)
    return true
  } catch (error) {
    console.error('Error deleting from S3:', error)
    return false
  }
}

/**
 * Generate a presigned URL for direct client uploads
 */
export const generatePresignedUploadUrl = async (
  fileKey: string,
  contentType: string,
  expiresIn: number = 3600 // 1 hour
): Promise<string> => {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: contentType,
      ACL: 'public-read',
    })

    return await getSignedUrl(s3Client, command, { expiresIn })
  } catch (error) {
    console.error('Error generating presigned URL:', error)
    throw new Error('Failed to generate presigned URL')
  }
}

/**
 * Generate a presigned URL for file access
 */
export const generatePresignedAccessUrl = async (
  fileKey: string,
  expiresIn: number = 3600 // 1 hour
): Promise<string> => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    })

    return await getSignedUrl(s3Client, command, { expiresIn })
  } catch (error) {
    console.error('Error generating presigned access URL:', error)
    throw new Error('Failed to generate presigned access URL')
  }
}

/**
 * Extract file key from S3 URL
 */
export const extractFileKeyFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname

    // Remove leading slash and return the key
    return pathname.startsWith('/') ? pathname.slice(1) : pathname
  } catch (error) {
    console.error('Error extracting file key from URL:', error)
    return null
  }
}

/**
 * Check if URL is from our S3 bucket
 */
export const isS3Url = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    return (
      urlObj.hostname.includes('digitaloceanspaces.com') &&
      urlObj.hostname.startsWith(BUCKET_NAME)
    )
  } catch {
    return false
  }
}

export { s3Client, BUCKET_NAME }
