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

const requireEnv = (name: string): string => {
  const v = process.env[name]
  if (!v) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return v
}

const AWS_REGION = requireEnv('AWS_REGION')
const ENDPOINT = requireEnv('AWS_ENDPOINT')
const AWS_ACCESS_KEY_ID = requireEnv('AWS_ACCESS_KEY_ID')
const AWS_SECRET_ACCESS_KEY = requireEnv('AWS_SECRET_ACCESS_KEY')
const BUCKET_NAME = (() => {
  const v = process.env.AWS_S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME
  if (!v) throw new Error('Missing AWS_S3_BUCKET_NAME or AWS_BUCKET_NAME')
  return v
})()
const PUBLIC_ENDPOINT = process.env.NEXT_PUBLIC_S3_PUBLIC_ENDPOINT || ENDPOINT
const CDN_ENDPOINT =
  process.env.NEXT_PUBLIC_S3_CDN_ENDPOINT || process.env.S3_CDN_ENDPOINT
const FORCE_PATH_STYLE = process.env.AWS_FORCE_PATH_STYLE === 'true'

const s3Client = new S3Client({
  region: AWS_REGION,
  endpoint: ENDPOINT,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: FORCE_PATH_STYLE,
})

// Build a browser-accessible public URL
// - Prefer PATH-STYLE for MinIO/localhost/IP/when port present or when FORCE_PATH_STYLE=true
// - For DO Spaces keep the virtual-hosted style.
const shouldUsePathStyle = (host: string, port?: string): boolean => {
  if (FORCE_PATH_STYLE) return true
  const lower = host.toLowerCase()
  const isLocal = lower === 'localhost' || lower === '127.0.0.1'
  const isIp = /^[0-9.]+$/.test(host)
  return lower.includes('minio') || isLocal || isIp || !!port
}

const buildPublicUrl = (fileKey: string): string => {
  // Try PUBLIC_ENDPOINT first
  try {
    const pub = new URL(PUBLIC_ENDPOINT)
    const proto = pub.protocol || 'http:'
    const host = pub.hostname
    const portStr = pub.port ? `:${pub.port}` : ''
    if (shouldUsePathStyle(host, pub.port)) {
      // Path-style
      return `${proto}//${host}${portStr}/${BUCKET_NAME}/${fileKey}`
    }
    // Virtual-hosted style
    return `${proto}//${BUCKET_NAME}.${host}${portStr}/${fileKey}`
  } catch {
    // ignore and fall through to ENDPOINT
  }

  // Fallback: derive from ENDPOINT
  try {
    const ep = new URL(ENDPOINT)
    const proto = ep.protocol || 'http:'
    const host = ep.hostname
    const portStr = ep.port ? `:${ep.port}` : ''
    if (shouldUsePathStyle(host, ep.port)) {
      return `${proto}//${host}${portStr}/${BUCKET_NAME}/${fileKey}`
    }
    return `${proto}//${BUCKET_NAME}.${host}${portStr}/${fileKey}`
  } catch {
    // Last resort: join strings safely
    const base = (ENDPOINT || '').replace(/\/+$/, '')
    return `${base}/${BUCKET_NAME}/${fileKey}`
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
  // Строго: CDN используется только если явно задан в .env,
  // иначе возвращаем публичный URL, сформированный из PUBLIC_ENDPOINT/ENDPOINT
  if (CDN_ENDPOINT) {
    try {
      const u = new URL(CDN_ENDPOINT)
      const base = `${u.protocol}//${u.host}${u.pathname.replace(/\/+$/, '')}`
      return `${base}/${fileKey}`
    } catch {
      const base = (CDN_ENDPOINT || '').replace(/\/+$/, '')
      return `${base}/${fileKey}`
    }
  }

  return buildPublicUrl(fileKey)
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
    const target = new URL(url)
    const host = target.hostname

    const publicHost = (() => {
      try {
        return new URL(PUBLIC_ENDPOINT).hostname
      } catch {
        return undefined
      }
    })()
    const endpointHost = (() => {
      try {
        return new URL(ENDPOINT).hostname
      } catch {
        return undefined
      }
    })()
    const cdnHost = (() => {
      try {
        return CDN_ENDPOINT ? new URL(CDN_ENDPOINT).hostname : undefined
      } catch {
        return undefined
      }
    })()

    // Direct match against configured hosts
    if (
      (publicHost && host === publicHost) ||
      (endpointHost && host === endpointHost) ||
      (cdnHost && host === cdnHost)
    ) {
      return true
    }

    // Virtual-hosted style: <bucket>.<endpointHost>
    if (
      endpointHost &&
      host.endsWith(`.${endpointHost}`) &&
      host.startsWith(`${BUCKET_NAME}.`)
    ) {
      return true
    }

    // DO Spaces CDN pattern: <bucket>.<region>.cdn.digitaloceanspaces.com
    if (
      host.endsWith('.cdn.digitaloceanspaces.com') &&
      host.startsWith(`${BUCKET_NAME}.`)
    ) {
      return true
    }

    return false
  } catch {
    return false
  }
}

export { s3Client, BUCKET_NAME }
