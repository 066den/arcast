import { PrismaClient } from '@prisma/client'
import { readFile } from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()
// Narrow utility type to the subset we call in this seed
type DbClient = {
  bookingAdditionalService: { deleteMany: () => Promise<unknown> }
  payment: { deleteMany: () => Promise<unknown> }
  paymentLink: { deleteMany: () => Promise<unknown> }
  webhookEvent: { deleteMany: () => Promise<unknown> }
  booking: { deleteMany: () => Promise<unknown> }
  discountCode: { deleteMany: () => Promise<unknown> }
  lead: { deleteMany: () => Promise<unknown> }
  additionalService: {
    deleteMany: () => Promise<unknown>
    create: (args: unknown) => Promise<unknown>
  }
  packagePerk: { deleteMany: () => Promise<unknown> }
  studioPackage: {
    deleteMany: () => Promise<unknown>
    create: (args: unknown) => Promise<{ id: string; name: string }>
  }
  studio: {
    deleteMany: () => Promise<unknown>
    create: (args: unknown) => Promise<unknown>
  }
}
const db = prisma as unknown as DbClient

type JsonRecord = Record<string, unknown>

type StudioInput = {
  name: string
  location: string
  imageUrl: string
  totalSeats: number
  openingTime: string
  closingTime: string
  packages?: { connect: { id: string }[] }
}

type AdditionalServiceTypeLiteral =
  | 'STANDARD_EDIT_SHORT_FORM'
  | 'CUSTOM_EDIT_SHORT_FORM'
  | 'STANDARD_EDIT_LONG_FORM'
  | 'CUSTOM_EDIT_LONG_FORM'
  | 'LIVE_VIDEO_CUTTING'
  | 'SUBTITLES'
  | 'TELEPROMPTER_SUPPORT'
  | 'MULTI_CAM_RECORDING'
  | 'EPISODE_TRAILER_LONG_FORM'
  | 'EPISODE_TRAILER_SHORT_FORM'
  | 'WARDROBE_STYLING_CONSULTATION'
  | 'PODCAST_DISTRIBUTION'

type AdditionalServiceJson = {
  title: string
  type: AdditionalServiceTypeLiteral
  price: number
  currency: string
  description: string
  imageUrls: string[]
  videoUrl?: string | null
  isActive?: boolean
  count?: number
  order?: number
}

type PackagePerkJson = {
  name: string
  count?: number
}

type StudioPackageJson = {
  name: string
  price_per_hour: number
  currency: string
  description: string
  delivery_time: number
  packagePerks?: { create: PackagePerkJson[] }
}

async function loadJson<T = unknown>(relativeFile: string): Promise<T> {
  const filePath = path.join(process.cwd(), 'prisma', relativeFile)
  const raw = await readFile(filePath, 'utf-8')
  return JSON.parse(raw) as T
}

function toDecimalString(value: number): string {
  // Prisma Decimal fields accept string inputs; keep as-is without forcing fixed decimals
  return String(value)
}

function derivePackageAlias(name: string): string | null {
  const lower = name.toLowerCase()
  if (lower.includes('professional edit')) return 'recordingEditPackage'
  if (lower === 'recording only') return 'recordingOnlyPackage'
  if (lower.includes('live video cutting')) return 'recordingLiveCuttingPackage'
  return null
}

async function main(): Promise<void> {
  // 1) Read data files
  console.log('✅ Starting seed script...')
  const [studiosJson, additionalServicesJson, packagesJson] = await Promise.all(
    [
      loadJson<StudioInput[]>('studios.json'),
      loadJson<AdditionalServiceJson[]>('additionalService.json'),
      loadJson<StudioPackageJson[]>('pacage.json'),
    ]
  )

  // 2) Cleanup existing data (order matters because of FKs)
  await db.bookingAdditionalService.deleteMany()
  await db.payment.deleteMany()
  await db.paymentLink.deleteMany()
  await db.webhookEvent.deleteMany()
  await db.booking.deleteMany()
  await db.discountCode.deleteMany()
  await db.lead.deleteMany()
  await db.additionalService.deleteMany()
  await db.packagePerk.deleteMany()
  // Disconnect M:N links by deleting parents; Prisma handles link table automatically
  await db.studioPackage.deleteMany()
  await db.studio.deleteMany()

  // 3) Create Studio Packages with perks
  const createdPackages = await Promise.all(
    packagesJson.map(pkg =>
      db.studioPackage.create({
        data: {
          name: pkg.name,
          price_per_hour: toDecimalString(pkg.price_per_hour),
          currency: pkg.currency,
          description: pkg.description,
          delivery_time: pkg.delivery_time,
          packagePerks: pkg.packagePerks?.create?.length
            ? {
                create: pkg.packagePerks.create.map(perk => ({
                  name: perk.name,
                  count:
                    typeof perk.count === 'number' ? perk.count : undefined,
                })),
              }
            : undefined,
        },
      })
    )
  )

  // Build alias -> id mapping for placeholder usage in studios.json
  const packageAliasToId: Record<string, string> = {}
  for (const p of createdPackages) {
    const alias = derivePackageAlias(p.name)
    if (alias) packageAliasToId[alias] = p.id
  }

  // 4) Create Additional Services
  await Promise.all(
    additionalServicesJson.map(svc =>
      db.additionalService.create({
        data: {
          title: svc.title,
          type: svc.type,
          price: toDecimalString(svc.price),
          currency: svc.currency,
          description: svc.description,
          imageUrls: Array.isArray(svc.imageUrls) ? svc.imageUrls : [],
          videoUrl: svc.videoUrl ?? null,
          isActive: svc.isActive ?? true,
          count: typeof svc.count === 'number' ? svc.count : undefined,
          order: typeof svc.order === 'number' ? svc.order : undefined,
        },
      })
    )
  )

  // 5) Create Studios and connect packages via placeholders in studios.json
  for (const studio of studiosJson) {
    // Transform placeholder connects like { id: "recordingEditPackage.id" }
    const connectInput: { id: string }[] = []
    const rawConnect = (studio.packages as JsonRecord | undefined)?.connect as
      | { id: string }[]
      | undefined
    if (rawConnect && Array.isArray(rawConnect)) {
      for (const c of rawConnect) {
        if (typeof c.id === 'string' && c.id.endsWith('.id')) {
          const alias = c.id.replace(/\.id$/, '')
          const mappedId = packageAliasToId[alias]
          if (mappedId) connectInput.push({ id: mappedId })
        } else if (c && typeof c.id === 'string') {
          connectInput.push({ id: c.id })
        }
      }
    }

    await db.studio.create({
      data: {
        name: studio.name,
        location: studio.location,
        imageUrl: studio.imageUrl,
        totalSeats: studio.totalSeats,
        openingTime: studio.openingTime,
        closingTime: studio.closingTime,
        packages: connectInput.length ? { connect: connectInput } : undefined,
      },
    })
  }

  // Done
  console.log('Seed completed successfully')
}

main()
  .catch(error => {
    console.error('Seed failed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
