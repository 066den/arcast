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
    console.error(`Missing required environment variable: ${name}`)
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
const EXPLICIT_FORCE_PATH_STYLE = process.env.AWS_FORCE_PATH_STYLE === 'true'
const AUTO_FORCE_PATH_STYLE = (() => {
  // Автоматически включаем path-style для MinIO/локальных/IP/с портом,
  // чтобы подпись совпадала с тем, как MinIO канонизирует запрос
  try {
    const ep = new URL(ENDPOINT)
    const host = ep.hostname.toLowerCase()
    const isLocal = host === 'localhost' || host === '127.0.0.1'
    const isIp = /^[0-9.]+$/.test(host)
    const hasPort = !!ep.port
    return host.includes('minio') || isLocal || isIp || hasPort
  } catch {
    // Если ENDPOINT некорректен — используем path-style по умолчанию
    return true
  }
})()
const FORCE_PATH_STYLE = EXPLICIT_FORCE_PATH_STYLE || AUTO_FORCE_PATH_STYLE

// Определяем MinIO-окружение для безопасной схемы загрузки (presigned PUT)
const IS_MINIO = (() => {
  try {
    const ep = new URL(ENDPOINT)
    const host = ep.hostname.toLowerCase()
    const isLocal = host === 'localhost' || host === '127.0.0.1'
    const isIp = /^[0-9.]+$/.test(host)
    return host.includes('minio') || isLocal || isIp
  } catch {
    return false
  }
})()

const S3_KEY_PREFIXES = new Set([
  'samples',
  'clients',
  'case-studies',
  'studios',
  'staff',
  'equipment',
  'blog',
  'uploads',
])
//const DEFAULT_VIDEO_PREFIX = 'samples'

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

const buildPublicUrl = (
  fileKey: string,
  bucket: string = BUCKET_NAME
): string => {
  // Try PUBLIC_ENDPOINT first
  try {
    const pub = new URL(PUBLIC_ENDPOINT)
    const proto = pub.protocol || 'http:'
    const host = pub.hostname
    const portStr = pub.port ? `:${pub.port}` : ''
    if (shouldUsePathStyle(host, pub.port)) {
      // Path-style
      return `${proto}//${host}${portStr}/${bucket}/${fileKey}`
    }
    // Virtual-hosted style
    return `${proto}//${bucket}.${host}${portStr}/${fileKey}`
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
      return `${proto}//${host}${portStr}/${bucket}/${fileKey}`
    }
    return `${proto}//${bucket}.${host}${portStr}/${fileKey}`
  } catch {
    // Last resort: join strings safely
    const base = (ENDPOINT || '').replace(/\/+$/, '')
    return `${base}/${bucket}/${fileKey}`
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

    const bucketName = BUCKET_NAME
    const normalizedFolder = folder.replace(/^\/+|\/+$/g, '')
    const fileKey = normalizedFolder
      ? `${normalizedFolder}/${fileName}`
      : fileName

    // Prepare file buffer
    let fileBuffer: Buffer
    let fileContentType = contentType

    if (file instanceof File) {
      fileBuffer = Buffer.from(await file.arrayBuffer())
      fileContentType = fileContentType || file.type
    } else {
      fileBuffer = file
    }
    if (!fileContentType) {
      fileContentType = 'application/octet-stream'
    }

    // Upload parameters (минимальный набор для исключения расхождений подписи на MinIO)
    const uploadParams = {
      Bucket: bucketName,
      Key: fileKey,
      Body: fileBuffer,
    }

    if (IS_MINIO) {
      // Для MinIO уходим от подписи заголовков и используем presigned PUT без дополнительных хедеров
      const presignedUrl = await getSignedUrl(
        s3Client,
        new PutObjectCommand({
          Bucket: bucketName,
          Key: fileKey,
        }),
        { expiresIn: 300 }
      )

      const putRes = await fetch(presignedUrl, {
        method: 'PUT',
        // Node/Next runtime поддерживает BufferSource; используем Uint8Array для типовой совместимости
        body: new Uint8Array(fileBuffer),
      })

      if (!putRes.ok) {
        throw new Error(`Presigned PUT failed with status ${putRes.status}`)
      }
    } else {
      const command = new PutObjectCommand(uploadParams)
      await s3Client.send(command)
    }

    const publicUrl = buildPublicUrl(fileKey, bucketName)
    const cdnUrl = getCdnUrl(fileKey)

    console.log('Uploaded file:', {
      fileKey,
      bucket: bucketName,
      publicUrl,
      cdnUrl,
      cdnEnabled: !!CDN_ENDPOINT,
    })

    return {
      url: publicUrl,
      cdnUrl,
      key: fileKey,
      bucket: bucketName,
    }
  } catch (error) {
    console.error('S3 upload error:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to upload file to S3: ${errorMessage}`)
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
    })

    return await getSignedUrl(s3Client, command, { expiresIn })
  } catch (error) {
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
    // Try to abort the multipart upload if it was created
    if (typeof UploadId !== 'undefined') {
      try {
        const abortCommand = new AbortMultipartUploadCommand({
          Bucket: BUCKET_NAME,
          Key: fileKey,
          UploadId,
        })
        await s3Client.send(abortCommand)
      } catch (abortError) {}
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
        'Content-Type': contentType,
      },
      Conditions: [
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
    return null
  }
}

const parseOrigin = (value?: string) => {
  if (!value) return null
  try {
    const parsed = new URL(value)
    return {
      hostname: parsed.hostname,
      port: parsed.port || '',
    }
  } catch {
    return null
  }
}

const PUBLIC_ORIGIN = parseOrigin(PUBLIC_ENDPOINT)
const ENDPOINT_ORIGIN = parseOrigin(ENDPOINT)
const CDN_ORIGIN = parseOrigin(CDN_ENDPOINT)

const matchesOrigin = (
  target: URL,
  origin: { hostname: string; port: string } | null
) => {
  if (!origin) return false
  if (target.hostname !== origin.hostname) return false
  if (!origin.port) {
    return target.port === '' || target.port === origin.port
  }
  return target.port === origin.port
}

/**
 * Check if URL is from our S3 bucket
 */
export const isS3Url = (url: string): boolean => {
  try {
    const target = new URL(url)
    const host = target.hostname

    if (
      matchesOrigin(target, PUBLIC_ORIGIN) ||
      matchesOrigin(target, ENDPOINT_ORIGIN) ||
      matchesOrigin(target, CDN_ORIGIN)
    ) {
      return true
    }

    // Virtual-hosted style: <bucket>.<endpointHost>
    if (
      ENDPOINT_ORIGIN &&
      host.endsWith(`.${ENDPOINT_ORIGIN.hostname}`) &&
      host.startsWith(`${BUCKET_NAME}.`) &&
      (ENDPOINT_ORIGIN.port ? target.port === ENDPOINT_ORIGIN.port : true)
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

/**
 * Normalize video URL to ensure consistent format (full CDN URL)
 * Handles multiple input formats:
 * - Full CDN URLs: https://cdn.example.com/path/to/file.mp4
 * - Full public URLs: https://public.example.com/bucket/path/to/file.mp4
 * - Relative S3 paths: samples/video.mp4 or /samples/video.mp4
 * - Legacy formats: any other valid URL format
 */
// export const normalizeVideoUrl = (
//   url: string | null | undefined
// ): string | null => {
//   if (!url) return null

//   const normalizeKey = (rawPath: string): string | null => {
//     if (!rawPath) return null
//     const trimmed = rawPath.replace(/^\/+/, '')
//     if (!trimmed) return null

//     const withoutBucket = trimmed.startsWith(`${BUCKET_NAME}/`)
//       ? trimmed.slice(BUCKET_NAME.length + 1)
//       : trimmed

//     if (!withoutBucket) return null

//     const parts = withoutBucket.split('/').filter(Boolean)
//     if (!parts.length) return null

//     // if (parts.length === 1) {
//     //   const [first] = parts
//     //   if (first.includes('.')) {
//     //     return `${DEFAULT_VIDEO_PREFIX}/${first}`
//     //   }
//     //   return null
//     // }

//     if (!S3_KEY_PREFIXES.has(parts[0])) {
//       return null
//     }

//     return parts.join('/')
//   }

//   // Handle full URLs (http/https)
//   if (/^https?:\/\//.test(url)) {
//     try {
//       const urlObj = new URL(url)
//       const normalizedKey = normalizeKey(urlObj.pathname)
//       if (normalizedKey) {
//         return getCdnUrl(normalizedKey)
//       }

//       return url
//     } catch (e) {
//       console.error('Error parsing URL:', url, e)
//       return url
//     }
//   }

//   // Handle relative paths
//   const cleanPath = url.replace(/^\/+/, '') // Remove leading slashes

//   const normalizedKey = normalizeKey(cleanPath)
//   if (normalizedKey) {
//     return getCdnUrl(normalizedKey)
//   }

//   // For other relative paths, return as root-relative URL (for legacy/local assets)
//   return url.startsWith('/') ? url : `/${url}`
// }

export { s3Client, BUCKET_NAME }
