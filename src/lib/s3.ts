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

// Validate S3 configuration and log it (without exposing secrets)
// Only log in runtime, not during build
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  try {
    console.log('S3 Configuration:', {
      region: AWS_REGION,
      endpoint: ENDPOINT,
      bucket: BUCKET_NAME,
      forcePathStyle: FORCE_PATH_STYLE,
      hasCredentials: !!(AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY),
      publicEndpoint: PUBLIC_ENDPOINT,
      cdnEndpoint: CDN_ENDPOINT || 'Not configured',
      provider: ENDPOINT.includes('digitaloceanspaces.com')
        ? 'DigitalOcean Spaces'
        : ENDPOINT.includes('minio')
          ? 'MinIO'
          : ENDPOINT.includes('amazonaws.com')
            ? 'AWS S3'
            : 'Unknown',
    })
  } catch {
    // Silently fail during build if env vars are not available
    console.warn('S3 configuration not available during build')
  }
}

// Configure S3 client with MinIO-specific settings
const isMinIO =
  ENDPOINT.includes('minio') ||
  ENDPOINT.includes('localhost') ||
  ENDPOINT.includes('127.0.0.1')

// For MinIO, don't add checksum config to avoid signature issues
const s3ClientConfig: any = {
  region: AWS_REGION,
  endpoint: ENDPOINT,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: FORCE_PATH_STYLE,
}

// Only add checksum config for non-MinIO providers
if (!isMinIO) {
  s3ClientConfig.requestChecksumCalculation = 'when-required'
  s3ClientConfig.responseChecksumValidation = 'when-supported'
}

// Custom middleware to remove checksum headers for MinIO
// This must run AFTER signing (serialize step) to remove headers added by flexible-checksums
const removeChecksumHeadersMiddleware = (next: any) => async (args: any) => {
  const request = args.request
  if (request && request.headers) {
    // Log headers before removal for debugging
    const headersBefore = Object.keys(request.headers).filter(
      h =>
        h.toLowerCase().includes('checksum') || h.toLowerCase().includes('md5')
    )
    if (headersBefore.length > 0) {
      console.log('Removing checksum headers before request:', headersBefore)
    }

    // Remove all checksum-related headers
    const checksumHeaders = [
      'x-amz-checksum-algorithm',
      'x-amz-checksum-crc32',
      'x-amz-checksum-crc32c',
      'x-amz-checksum-sha1',
      'x-amz-checksum-sha256',
      'Content-MD5',
    ]
    checksumHeaders.forEach(header => {
      const lowerHeader = header.toLowerCase()
      if (request.headers[header]) {
        delete request.headers[header]
        console.log(`Removed header: ${header}`)
      }
      if (request.headers[lowerHeader]) {
        delete request.headers[lowerHeader]
        console.log(`Removed header: ${lowerHeader}`)
      }
      // Also remove any case variations
      Object.keys(request.headers).forEach(key => {
        if (key.toLowerCase() === lowerHeader) {
          delete request.headers[key]
          console.log(`Removed header (case variant): ${key}`)
        }
      })
    })
  }
  return next(args)
}

// For MinIO, create client without checksum middleware to avoid signature issues
let s3Client: S3Client
if (isMinIO) {
  // Create client and then add middleware to remove checksum headers
  s3Client = new S3Client(s3ClientConfig)

  // Add custom middleware to remove checksum headers
  try {
    // Add middleware to finalizeRequest step with high priority to run AFTER signing
    // This ensures checksum headers added by flexible-checksums are removed after signing
    s3Client.middlewareStack.add(removeChecksumHeadersMiddleware, {
      step: 'finalizeRequest',
      priority: 'high',
      tags: ['MINIO_CHECKSUM_REMOVAL'],
    })
    console.log(
      'Added checksum header removal middleware to finalizeRequest step (high priority)'
    )

    // Try to remove checksum middleware using different methods
    const middlewareIds = s3Client.middlewareStack.identify()
    const checksumId = middlewareIds.find(
      (id: string) =>
        id.toLowerCase().includes('checksum') ||
        id.toLowerCase().includes('flexible')
    )
    if (checksumId) {
      try {
        s3Client.middlewareStack.remove(checksumId)
        console.log('Removed checksum middleware:', checksumId)
      } catch (removeError) {
        console.warn('Could not remove checksum middleware:', removeError)
      }
    }

    // Log all middleware for debugging
    console.log('Available middleware IDs:', middlewareIds)
  } catch (error) {
    console.warn('Could not configure checksum removal middleware:', error)
  }

  console.log('MinIO detected - checksums disabled in S3Client config')
} else {
  s3Client = new S3Client(s3ClientConfig)
}

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
    // For HTTPS, don't include port if it's standard (443) or if not specified
    // For HTTP, include port only if explicitly specified
    let portStr = ''
    if (proto === 'https:') {
      // HTTPS: include port only if it's non-standard (not 443)
      if (pub.port && pub.port !== '443') {
        portStr = `:${pub.port}`
      }
    } else if (proto === 'http:') {
      // HTTP: include port only if explicitly specified (not 80)
      if (pub.port && pub.port !== '80') {
        portStr = `:${pub.port}`
      }
    }

    // For MinIO public endpoints, always use path-style with bucket prefix
    // This works for both localhost and production (arcast.studio:9000)
    if (
      host.includes('s3.arcast.studio') ||
      (host.includes('arcast.studio') && pub.port === '9000') ||
      host === 'localhost' ||
      host === '127.0.0.1' ||
      shouldUsePathStyle(host, pub.port)
    ) {
      // Path-style:
      // - http://localhost/arcast-s3/samples/... (local)
      // - https://arcast.studio:9000/arcast-s3/samples/... (production)
      return `${proto}//${host}${portStr}/${bucket}/${fileKey}`
    }
    // Virtual-hosted style (for non-MinIO providers)
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
    let fileSize: number

    if (file instanceof File) {
      fileSize = file.size
      fileBuffer = Buffer.from(await file.arrayBuffer())
      fileContentType = fileContentType || file.type
      console.log('Uploading file to S3:', {
        fileName,
        fileKey,
        size: fileSize,
        contentType: fileContentType,
        folder,
        bucket: bucketName,
      })
    } else {
      fileBuffer = file
      fileSize = file.length
      console.log('Uploading buffer to S3:', {
        fileName,
        fileKey,
        size: fileSize,
        contentType: fileContentType,
        folder,
        bucket: bucketName,
      })
    }
    if (!fileContentType) {
      fileContentType = 'application/octet-stream'
    }

    // For MinIO, use official MinIO client to bypass AWS SDK checksum middleware
    // The MinIO client handles signature correctly without checksum issues
    // Use dynamic import only on server side to avoid bundling in client code
    if (isMinIO && typeof window === 'undefined') {
      console.log(
        'MinIO upload - using official MinIO client to avoid checksum middleware'
      )

      // Dynamic import MinIO client only on server side
      const Minio = await import('minio')
      const endpoint = new URL(ENDPOINT)

      // Verify credentials are set
      if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
        throw new Error('MinIO credentials are not configured')
      }

      // MinIO client configuration - minimal config for local MinIO
      // Explicitly set region to avoid getBucketRegionAsync call that causes signature issues
      const minioClient = new Minio.Client({
        endPoint: endpoint.hostname,
        port: endpoint.port ? parseInt(endpoint.port, 10) : 9000,
        useSSL: endpoint.protocol === 'https:',
        accessKey: AWS_ACCESS_KEY_ID,
        secretKey: AWS_SECRET_ACCESS_KEY,
        region: AWS_REGION || 'us-east-1', // Explicit region to avoid region lookup
      })

      const contentType = fileContentType || 'application/octet-stream'

      // Prepare metadata - MinIO expects Content-Type as standard header
      const metaData: Record<string, string> = {
        'Content-Type': contentType,
      }

      // Add custom metadata with 'x-amz-meta-' prefix
      Object.entries(metadata).forEach(([key, value]) => {
        metaData[`x-amz-meta-${key}`] = String(value)
      })

      console.log('Uploading to MinIO via MinIO client:', {
        fileKey,
        fileSize,
        contentType,
        bucket: bucketName,
        endpoint: `${endpoint.protocol}//${endpoint.hostname}:${endpoint.port || 9000}`,
        hostname: endpoint.hostname,
        port: endpoint.port || 9000,
      })

      // Use MinIO client - pass Buffer directly (it accepts Buffer)
      await minioClient.putObject(
        bucketName,
        fileKey,
        fileBuffer,
        fileSize,
        metaData
      )

      console.log('Successfully uploaded file to MinIO via MinIO client:', {
        fileKey,
        size: fileSize,
      })

      const publicUrl = buildPublicUrl(fileKey, bucketName)
      const cdnUrl = getCdnUrl(fileKey)

      console.log('Generated public URL for MinIO upload:', {
        fileKey,
        publicUrl,
        cdnUrl,
        publicEndpoint: PUBLIC_ENDPOINT,
      })

      return {
        url: publicUrl,
        cdnUrl,
        key: fileKey,
        bucket: bucketName,
      }
    }

    // For non-MinIO providers, use direct PutObjectCommand
    // Upload parameters
    // Note: Some S3-compatible providers (like DigitalOcean Spaces) may not support ACL
    // Files are made public through bucket policies or settings instead
    const uploadParams: any = {
      Bucket: bucketName,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: fileContentType,
      Metadata: metadata,
    }

    // Try to set ACL if supported (some providers don't support this)
    // DigitalOcean Spaces doesn't support ACL - files are public by default if bucket is public
    try {
      // Only add ACL if not using DigitalOcean Spaces (DO doesn't support ACL)
      if (!ENDPOINT.includes('digitaloceanspaces.com')) {
        uploadParams.ACL = 'public-read'
      }
    } catch {
      // Ignore ACL errors if not supported
    }

    const command = new PutObjectCommand(uploadParams)

    console.log('Sending upload command to S3...')
    const startTime = Date.now()
    await s3Client.send(command)
    const uploadTime = Date.now() - startTime

    const publicUrl = buildPublicUrl(fileKey, bucketName)
    const cdnUrl = getCdnUrl(fileKey)

    console.log('Successfully uploaded file to S3:', {
      fileKey,
      bucket: bucketName,
      publicUrl,
      cdnUrl,
      cdnEnabled: !!CDN_ENDPOINT,
      uploadTimeMs: uploadTime,
      fileSize,
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
    const errorDetails: any = {
      fileName,
      folder: options.folder,
      bucket: BUCKET_NAME,
      endpoint: ENDPOINT,
      errorMessage,
    }

    if (error instanceof Error) {
      errorDetails.errorName = error.name
      errorDetails.errorStack = error.stack

      // Check for common S3 errors
      if (
        error.message.includes('AccessDenied') ||
        error.message.includes('403')
      ) {
        errorDetails.suggestion = 'Check S3 credentials and bucket permissions'
      } else if (
        error.message.includes('NoSuchBucket') ||
        error.message.includes('404')
      ) {
        errorDetails.suggestion =
          'Bucket does not exist. Create it or check bucket name'
      } else if (error.message.includes('InvalidAccessKeyId')) {
        errorDetails.suggestion =
          'Invalid AWS Access Key ID. Check AWS_ACCESS_KEY_ID'
      } else if (error.message.includes('SignatureDoesNotMatch')) {
        errorDetails.suggestion =
          'Invalid AWS Secret Access Key. Check AWS_SECRET_ACCESS_KEY'
      } else if (error.message.includes('RequestTimeTooSkewed')) {
        errorDetails.suggestion =
          'System clock is out of sync. Sync system time'
      }
    }

    console.error('S3 upload error details:', errorDetails)
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
    console.error('Failed to delete file from S3:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    console.error('Delete error details:', { fileKey, errorMessage })
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
    // Build command params - ACL may not be supported by all providers
    const commandParams: any = {
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: contentType,
    }

    // Only add ACL if not using DigitalOcean Spaces
    if (!ENDPOINT.includes('digitaloceanspaces.com')) {
      commandParams.ACL = 'public-read'
    }

    const command = new PutObjectCommand(commandParams)
    return await getSignedUrl(s3Client, command, { expiresIn })
  } catch (error) {
    console.error('Failed to generate presigned URL:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to generate presigned URL: ${errorMessage}`)
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
    console.error('Failed to generate presigned access URL:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to generate presigned access URL: ${errorMessage}`)
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
        ContentLength: buffer.length,
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
    console.error('Failed to upload large file:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    console.error('Upload error details:', { fileKey, fileName, errorMessage })

    // Try to abort the multipart upload if it was created
    if (typeof UploadId !== 'undefined') {
      try {
        const abortCommand = new AbortMultipartUploadCommand({
          Bucket: BUCKET_NAME,
          Key: fileKey,
          UploadId,
        })
        await s3Client.send(abortCommand)
        console.log('Multipart upload aborted successfully')
      } catch (abortError) {
        console.error('Failed to abort multipart upload:', abortError)
      }
    }

    throw new Error(`Failed to upload large file: ${errorMessage}`)
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
    const { url, fields: generatedFields } = await createPresignedPost(
      s3Client,
      {
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
      }
    )

    const cdnUrl = getCdnUrl(fileKey)

    return {
      url,
      fields: generatedFields,
      fileKey,
      cdnUrl,
    }
  } catch (error) {
    console.error('Failed to generate presigned POST:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to generate presigned POST: ${errorMessage}`)
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
  } catch {
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
