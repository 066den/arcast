import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.AWS_ENDPOINT || 'https://blr1.digitaloceanspaces.com',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'DO801ZANC8M4JR4ANL7Z',
    secretAccessKey:
      process.env.AWS_SECRET_ACCESS_KEY ||
      'R1umCcwzZQtooGLR1eccRTNh0KBVqrptLZVpWlEmZEo',
  },
  forcePathStyle: false,
})

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'arcast-s3'

const ENDPOINT = process.env.AWS_ENDPOINT || 'https://blr1.digitaloceanspaces.com'
const PUBLIC_ENDPOINT =
  process.env.NEXT_PUBLIC_S3_PUBLIC_ENDPOINT || ENDPOINT

const isMinio = (() => {
  try {
    const h = new URL(ENDPOINT).hostname
    return h.includes('minio')
  } catch {
    return false
  }
})()

// Build a browser-accessible public URL
// - For MinIO we prefer PATH-STYLE using PUBLIC_ENDPOINT host (e.g. http://localhost:9000/bucket/key),
//   so it works from outside Docker without DNS for bucket subdomains.
// - For DO Spaces keep the original virtual-hosted style/CDN style.
const buildPublicUrl = (fileKey: string): string => {
  try {
    const pub = new URL(PUBLIC_ENDPOINT)
    const proto = pub.protocol || 'http:'
    const host = pub.hostname
    const port = pub.port ? `:${pub.port}` : ''
    if (host.includes('minio')) {
      // Path-style for MinIO (accessible from host)
      return `${proto}//${host}${port}/${BUCKET_NAME}/${fileKey}`
    }
    // Virtual-hosted style for DO Spaces and other S3-compatible endpoints
    return `${proto}//${BUCKET_NAME}.${host}${port}/${fileKey}`
  } catch {
    // PUBLIC_ENDPOINT is invalid; fall back to ENDPOINT
    try {
      const ep = new URL(ENDPOINT)
      const proto = ep.protocol || 'http:'
      const host = ep.hostname
      const port = ep.port ? `:${ep.port}` : ''
      return `${proto}//${BUCKET_NAME}.${host}${port}/${fileKey}`
    } catch {
      // Last resort: join strings safely
      const base = (ENDPOINT || '').replace(/\/+$/, '')
      return `${base}/${BUCKET_NAME}/${fileKey}`
    }
  }
}

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

export interface PresignedPostOptions {
  folder?: string
  contentType?: string
  expiresIn?: number
  maxFileSize?: number
}

export interface PresignedPostResult {
  url: string
  fields: Record<string, string>
  fileKey: string
  cdnUrl: string
}

/**
 * Get CDN URL for a file (if CDN is enabled)
 */
export const getCdnUrl = (fileKey: string): string => {
  if (isMinio) {
    // For MinIO use same public URL (no CDN)
    return buildPublicUrl(fileKey)
  }
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
    const publicUrl = buildPublicUrl(fileKey)
    const cdnUrl = getCdnUrl(fileKey)

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
 * Upload large file using multipart upload for better performance
 */
export const uploadLargeFileToS3 = async (
  file: File,
  fileName: string,
  options: UploadOptions = {}
): Promise<UploadResult> => {
  let fileKey: string = ''
  let UploadId: string | undefined

  try {
    const {
      folder = 'uploads',
      contentType = 'video/mp4',
      metadata = {},
    } = options

    const fileExtension = fileName.split('.').pop()
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`
    fileKey = folder ? `${folder}/${uniqueFileName}` : uniqueFileName

    // Create multipart upload
    const createCommand = new CreateMultipartUploadCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: contentType,
      Metadata: metadata,
    })

    const { UploadId: createdUploadId } = await s3Client.send(createCommand)
    UploadId = createdUploadId

    // Upload parts (5MB each)
    const partSize = 5 * 1024 * 1024 // 5MB
    const totalParts = Math.ceil(file.size / partSize)
    const uploadedParts: { ETag: string; PartNumber: number }[] = []

    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
      const start = (partNumber - 1) * partSize
      const end = Math.min(start + partSize, file.size)
      const chunk = file.slice(start, end)

      // Convert File chunk to ArrayBuffer for proper handling
      const arrayBuffer = await chunk.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const uploadCommand = new UploadPartCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
        PartNumber: partNumber,
        UploadId,
        Body: buffer,
      })

      const { ETag } = await s3Client.send(uploadCommand)
      uploadedParts.push({ ETag: ETag!, PartNumber: partNumber })
    }

    // Complete multipart upload
    const completeCommand = new CompleteMultipartUploadCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      UploadId,
      MultipartUpload: {
        Parts: uploadedParts,
      },
    })

    await s3Client.send(completeCommand)

    const cdnUrl = getCdnUrl(fileKey)

    return {
      url: buildPublicUrl(fileKey),
      cdnUrl,
      key: fileKey,
      bucket: BUCKET_NAME,
    }
  } catch (error) {
    console.error('Error in multipart upload:', error)

    // Try to abort the multipart upload if it was created
    if (typeof UploadId !== 'undefined') {
      try {
        const abortCommand = new AbortMultipartUploadCommand({
          Bucket: BUCKET_NAME,
          Key: fileKey,
          UploadId,
        })
        await s3Client.send(abortCommand)
      } catch (abortError) {
        console.error('Failed to abort multipart upload:', abortError)
      }
    }

    throw new Error('Failed to upload large file')
  }
}

/**
 * Generate a presigned POST for direct client uploads
 * This is more efficient than presigned PUT for file uploads
 */
export const generatePresignedPost = async (
  fileName: string,
  options: PresignedPostOptions = {}
): Promise<PresignedPostResult> => {
  try {
    const {
      folder = 'uploads',
      contentType = 'video/mp4',
      expiresIn = 3600, // 1 hour
      maxFileSize = 500 * 1024 * 1024, // 500MB default
    } = options

    // Generate unique file key
    const fileExtension = fileName.split('.').pop()
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`
    const fileKey = folder ? `${folder}/${uniqueFileName}` : uniqueFileName

    // Create presigned POST with simplified conditions
    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Fields: {
        acl: 'public-read',
        'Content-Type': contentType,
      },
      Conditions: [
        { acl: 'public-read' },
        { 'Content-Type': contentType },
        ['content-length-range', 0, maxFileSize],
      ],
      Expires: expiresIn,
    })

    const cdnUrl = getCdnUrl(fileKey)

    return {
      url,
      fields,
      fileKey,
      cdnUrl,
    }
  } catch (error) {
    console.error('Error generating presigned POST:', error)
    throw new Error('Failed to generate presigned POST')
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
    const host = urlObj.hostname
    if (host.includes('minio')) {
      // Path-style: host is PUBLIC_ENDPOINT host (e.g. localhost), accept it
      return true
    }
    return (
      host.includes('digitaloceanspaces.com') &&
      host.startsWith(BUCKET_NAME)
    )
  } catch {
    return false
  }
}

export { s3Client, BUCKET_NAME }
