// Migration script: move local images from public/uploads to S3 and update DB URLs
// Usage:
//   node scripts/migrate-local-images-to-s3.js            # run migration (delete local files after successful upload)
//   node scripts/migrate-local-images-to-s3.js --dry-run  # preview only (no uploads, no DB updates)
//   node scripts/migrate-local-images-to-s3.js --keep-local  # keep local files after successful upload
//
// Notes:
// - Reads AWS_* and NEXT_PUBLIC_S3_* from .env (same as app).
// - Builds public/CDN URLs consistent with src/lib/s3.ts.
// - Handles string fields and string[] (e.g., gallery, imageUrls).
// - Safely skips records whose local file is missing.

const path = require('path')
const fs = require('fs')
const fsp = require('fs/promises')
require('dotenv').config({ path: path.resolve(process.cwd(), 'arcast-denis', '.env') })

const { PrismaClient } = require('@prisma/client')
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3')

const prisma = new PrismaClient()

// CLI flags
const DRY_RUN = process.argv.includes('--dry-run')
const KEEP_LOCAL = process.argv.includes('--keep-local')

// Env helpers
function requireEnv(name) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing required environment variable: ${name}`)
  return v
}

const AWS_REGION = requireEnv('AWS_REGION')
const ENDPOINT = requireEnv('AWS_ENDPOINT')
const AWS_ACCESS_KEY_ID = requireEnv('AWS_ACCESS_KEY_ID')
const AWS_SECRET_ACCESS_KEY = requireEnv('AWS_SECRET_ACCESS_KEY')
const BUCKET_NAME =
  process.env.AWS_S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME || (() => {
    throw new Error('Missing AWS_S3_BUCKET_NAME or AWS_BUCKET_NAME')
  })()

const PUBLIC_ENDPOINT = process.env.NEXT_PUBLIC_S3_PUBLIC_ENDPOINT || ENDPOINT
const CDN_ENDPOINT =
  process.env.NEXT_PUBLIC_S3_CDN_ENDPOINT || process.env.S3_CDN_ENDPOINT || ''
const FORCE_PATH_STYLE = process.env.AWS_FORCE_PATH_STYLE === 'true'

// Create S3 client
const s3Client = new S3Client({
  region: AWS_REGION,
  endpoint: ENDPOINT,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: FORCE_PATH_STYLE,
})

function isLocalUploadUrl(url) {
  if (!url) return false
  try {
    // absolute URL case
    const u = new URL(url, 'http://dummy-base.local')
    const pathname = u.pathname || ''
    return pathname.startsWith('/uploads/')
  } catch {
    // relative URL (likely '/uploads/..')
    return String(url).startsWith('/uploads/')
  }
}

function localPathFromUrl(url) {
  const u = new URL(url, 'http://dummy-base.local')
  let pathname = u.pathname || ''
  if (!pathname.startsWith('/uploads/')) {
    throw new Error(`Not a local uploads URL: ${url}`)
  }
  // projectRoot/arcast-denis/public/uploads/...
  return path.join(process.cwd(), 'arcast-denis', 'public', pathname.replace(/^\/+/, ''))
}

// rudimentary content-type resolution by extension
function guessContentType(fileName) {
  const ext = (fileName.split('.').pop() || '').toLowerCase()
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'webp':
      return 'image/webp'
    case 'gif':
      return 'image/gif'
    case 'svg':
      return 'image/svg+xml'
    case 'avif':
      return 'image/avif'
    default:
      return 'application/octet-stream'
  }
}

function buildPublicUrl(fileKey) {
  // Prefer PUBLIC_ENDPOINT path-style for MinIO hosts (compat with app logic)
  try {
    const pub = new URL(PUBLIC_ENDPOINT)
    const proto = pub.protocol || 'http:'
    const host = pub.hostname
    const port = pub.port ? `:${pub.port}` : ''
    if (host.includes('minio')) {
      return `${proto}//${host}${port}/${BUCKET_NAME}/${fileKey}`
    }
    return `${proto}//${BUCKET_NAME}.${host}${port}/${fileKey}`
  } catch {
    // fallback to ENDPOINT
  }
  try {
    const ep = new URL(ENDPOINT)
    const proto = ep.protocol || 'http:'
    const host = ep.hostname
    const port = ep.port ? `:${ep.port}` : ''
    return `${proto}//${BUCKET_NAME}.${host}${port}/${fileKey}`
  } catch {
    const base = (ENDPOINT || '').replace(/\/+$/, '')
    return `${base}/${BUCKET_NAME}/${fileKey}`
  }
}

function getCdnUrl(fileKey) {
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

// Upload a file path to S3 under folder (keeps original basename by default)
async function uploadFileToS3FromPath(absPath, folder, preferredName) {
  const exists = await fsp
    .access(absPath)
    .then(() => true)
    .catch(() => false)
  if (!exists) throw new Error(`Local file missing: ${absPath}`)

  const base = preferredName || path.basename(absPath)
  const fileKey = folder ? `${folder.replace(/^\/+|\/+$/g, '')}/${base}` : base
  const buf = await fsp.readFile(absPath)
  const contentType = guessContentType(base)

  if (DRY_RUN) {
    return { key: fileKey, url: buildPublicUrl(fileKey), cdnUrl: getCdnUrl(fileKey), skipped: true }
  }

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Body: buf,
      ContentType: contentType,
      ACL: 'public-read',
      Metadata: {
        migratedFrom: 'local-uploads',
        migratedAt: new Date().toISOString(),
      },
    })
  )

  return { key: fileKey, url: buildPublicUrl(fileKey), cdnUrl: getCdnUrl(fileKey), skipped: false }
}

async function deleteLocalFileIfNeeded(absPath) {
  if (KEEP_LOCAL || DRY_RUN) return false
  try {
    await fsp.unlink(absPath)
    return true
  } catch {
    return false
  }
}

function chooseFolderForField(entity, field, extra) {
  switch (entity) {
    case 'equipment':
      return 'equipment'
    case 'staff':
      return 'staff'
    case 'client':
      return 'clients'
    case 'studio':
      if (field === 'gallery' && extra?.id) return `studios/gallery/${extra.id}`
      return 'studios'
    case 'case-study':
      return 'case-studies'
    case 'sample':
      return 'samples'
    case 'blog':
      return 'blog'
    default:
      return 'uploads'
  }
}

async function migrateSingleUrl(localUrl, entity, field, id, extra) {
  const absPath = localPathFromUrl(localUrl)
  const folder = chooseFolderForField(entity, field, extra)
  const baseName = path.basename(absPath)
  const { key, url, cdnUrl, skipped } = await uploadFileToS3FromPath(absPath, folder, baseName)
  const newUrl = cdnUrl || url

  const deleted = await deleteLocalFileIfNeeded(absPath)

  return {
    oldUrl: localUrl,
    newUrl,
    key,
    deletedLocal: deleted,
    skipped,
  }
}

// Processors per model/field
async function migrateEquipmentImageUrl() {
  const items = await prisma.equipment.findMany()
  let updated = 0
  for (const it of items) {
    if (isLocalUploadUrl(it.imageUrl)) {
      const res = await migrateSingleUrl(it.imageUrl, 'equipment', 'imageUrl', it.id)
      if (!DRY_RUN) {
        await prisma.equipment.update({ where: { id: it.id }, data: { imageUrl: res.newUrl } })
      }
      updated++
      console.log(`[equipment] ${it.id}: ${res.oldUrl} -> ${res.newUrl}`)
    }
  }
  return updated
}

async function migrateStaffImageUrl() {
  const items = await prisma.staff.findMany()
  let updated = 0
  for (const it of items) {
    if (isLocalUploadUrl(it.imageUrl)) {
      const res = await migrateSingleUrl(it.imageUrl, 'staff', 'imageUrl', it.id)
      if (!DRY_RUN) {
        await prisma.staff.update({ where: { id: it.id }, data: { imageUrl: res.newUrl } })
      }
      updated++
      console.log(`[staff] ${it.id}: ${res.oldUrl} -> ${res.newUrl}`)
    }
  }
  return updated
}

async function migrateClientImageUrl() {
  const items = await prisma.client.findMany()
  let updated = 0
  for (const it of items) {
    if (isLocalUploadUrl(it.imageUrl)) {
      const res = await migrateSingleUrl(it.imageUrl, 'client', 'imageUrl', it.id)
      if (!DRY_RUN) {
        await prisma.client.update({ where: { id: it.id }, data: { imageUrl: res.newUrl } })
      }
      updated++
      console.log(`[client] ${it.id}: ${res.oldUrl} -> ${res.newUrl}`)
    }
  }
  return updated
}

async function migrateStudioImageUrl() {
  const items = await prisma.studio.findMany()
  let updated = 0
  for (const it of items) {
    if (isLocalUploadUrl(it.imageUrl)) {
      const res = await migrateSingleUrl(it.imageUrl, 'studio', 'imageUrl', it.id)
      if (!DRY_RUN) {
        await prisma.studio.update({ where: { id: it.id }, data: { imageUrl: res.newUrl } })
      }
      updated++
      console.log(`[studio.imageUrl] ${it.id}: ${res.oldUrl} -> ${res.newUrl}`)
    }
    // gallery array
    if (Array.isArray(it.gallery) && it.gallery.length) {
      let changed = false
      const newGallery = []
      for (const url of it.gallery) {
        if (isLocalUploadUrl(url)) {
          const res = await migrateSingleUrl(url, 'studio', 'gallery', it.id, { id: it.id })
          newGallery.push(res.newUrl)
          changed = true
          console.log(`[studio.gallery] ${it.id}: ${res.oldUrl} -> ${res.newUrl}`)
        } else {
          newGallery.push(url)
        }
      }
      if (changed && !DRY_RUN) {
        await prisma.studio.update({ where: { id: it.id }, data: { gallery: newGallery } })
      }
      if (changed) updated++
    }
  }
  return updated
}

async function migrateCaseStudyImageUrls() {
  const items = await prisma.caseStudy.findMany()
  let updated = 0
  for (const it of items) {
    if (Array.isArray(it.imageUrls) && it.imageUrls.length) {
      let changed = false
      const newUrls = []
      for (const u of it.imageUrls) {
        if (isLocalUploadUrl(u)) {
          const res = await migrateSingleUrl(u, 'case-study', 'imageUrls', it.id)
          newUrls.push(res.newUrl)
          changed = true
          console.log(`[caseStudy.imageUrls] ${it.id}: ${res.oldUrl} -> ${res.newUrl}`)
        } else {
          newUrls.push(u)
        }
      }
      if (changed && !DRY_RUN) {
        await prisma.caseStudy.update({ where: { id: it.id }, data: { imageUrls: newUrls } })
      }
      if (changed) updated++
    }
  }
  return updated
}

async function migrateBlogMainImage() {
  const items = await prisma.blogRecord.findMany()
  let updated = 0
  for (const it of items) {
    if (isLocalUploadUrl(it.mainImageUrl)) {
      const res = await migrateSingleUrl(it.mainImageUrl, 'blog', 'mainImageUrl', it.id)
      if (!DRY_RUN) {
        await prisma.blogRecord.update({ where: { id: it.id }, data: { mainImageUrl: res.newUrl } })
      }
      updated++
      console.log(`[blogRecord.mainImageUrl] ${it.id}: ${res.oldUrl} -> ${res.newUrl}`)
    }
  }
  return updated
}

async function migrateSampleThumbUrl() {
  const items = await prisma.sample.findMany()
  let updated = 0
  for (const it of items) {
    if (isLocalUploadUrl(it.thumbUrl)) {
      const res = await migrateSingleUrl(it.thumbUrl, 'sample', 'thumbUrl', it.id)
      if (!DRY_RUN) {
        await prisma.sample.update({ where: { id: it.id }, data: { thumbUrl: res.newUrl } })
      }
      updated++
      console.log(`[sample.thumbUrl] ${it.id}: ${res.oldUrl} -> ${res.newUrl}`)
    }
  }
  return updated
}

async function main() {
  console.log('=== Migrating local images to S3 ===')
  console.log(`Bucket: ${BUCKET_NAME}`)
  console.log(`Endpoint: ${ENDPOINT}`)
  console.log(`Public endpoint: ${PUBLIC_ENDPOINT}`)
  if (CDN_ENDPOINT) console.log(`CDN endpoint: ${CDN_ENDPOINT}`)
  console.log(`Dry run: ${DRY_RUN ? 'YES' : 'NO'}`)
  console.log(`Keep local: ${KEEP_LOCAL ? 'YES' : 'NO'}`)
  console.log('-----------------------------------')

  const results = {}
  results.equipment = await migrateEquipmentImageUrl()
  results.staff = await migrateStaffImageUrl()
  results.client = await migrateClientImageUrl()
  results.studio = await migrateStudioImageUrl()
  results.caseStudy = await migrateCaseStudyImageUrls()
  results.blog = await migrateBlogMainImage()
  results.sample = await migrateSampleThumbUrl()

  console.log('-----------------------------------')
  console.log('Migration summary (updated records per entity):')
  for (const [k, v] of Object.entries(results)) {
    console.log(`- ${k}: ${v}`)
  }
  console.log('Done.')
}

main()
  .catch(err => {
    console.error('Migration failed:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })