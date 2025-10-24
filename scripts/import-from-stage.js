#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const SOURCE = process.env.STAGE_SEED_SOURCE_URL
const BEARER = process.env.STAGE_SEED_BEARER
const HEADERS_JSON = process.env.STAGE_SEED_HEADERS

function joinUrl(base, path) {
  if (!base) return null
  const b = base.endsWith('/') ? base.slice(0, -1) : base
  const p = path.startsWith('/') ? path : `/${path}`
  return `${b}${p}`
}

function buildHeaders() {
  const headers = { 'Content-Type': 'application/json' }
  if (BEARER) headers['Authorization'] = `Bearer ${BEARER}`
  if (HEADERS_JSON) {
    try {
      const extra = JSON.parse(HEADERS_JSON)
      Object.assign(headers, extra)
    } catch (_) {}
  }
  return headers
}

async function fetchJSON(pathname) {
  const u = joinUrl(SOURCE, pathname)
  if (!u) throw new Error('STAGE_SEED_SOURCE_URL is not set')
  const res = await fetch(u, { headers: buildHeaders() })
  if (!res.ok) {
    throw new Error(`Fetch ${u} failed: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

function slugify(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-')
}

async function upsertServiceTypeByName(name, description) {
  if (!name) return null
  const slug = slugify(name)
  const existing = await prisma.serviceType.findFirst({ where: { name } })
  if (existing) {
    return (
      await prisma.serviceType.update({
        where: { id: existing.id },
        data: { description: description || existing.description, slug },
        select: { id: true },
      })
    ).id
  }
  return (
    await prisma.serviceType.create({
      data: { name, description: description || null, slug },
      select: { id: true },
    })
  ).id
}

async function upsertClientByName(name, data = {}) {
  if (!name) return null
  const existing = await prisma.client.findFirst({ where: { name } })
  if (existing) {
    return (
      await prisma.client.update({
        where: { id: existing.id },
        data,
        select: { id: true },
      })
    ).id
  }
  return (
    await prisma.client.create({
      data: { name, ...data },
      select: { id: true },
    })
  ).id
}

async function upsertStaffByName(name, data = {}) {
  if (!name) return null
  const existing = await prisma.staff.findFirst({ where: { name } })
  if (existing) {
    return (
      await prisma.staff.update({
        where: { id: existing.id },
        data,
        select: { id: true },
      })
    ).id
  }
  return (
    await prisma.staff.create({
      data: { name, ...data },
      select: { id: true },
    })
  ).id
}

async function upsertEquipmentByName(name, data = {}) {
  if (!name) return null
  const existing = await prisma.equipment.findFirst({ where: { name } })
  if (existing) {
    return (
      await prisma.equipment.update({
        where: { id: existing.id },
        data,
        select: { id: true },
      })
    ).id
  }
  return (
    await prisma.equipment.create({
      data: { name, ...data },
      select: { id: true },
    })
  ).id
}

async function importClients() {
  const list = await fetchJSON('/api/clients').catch(() => [])
  for (const c of list || []) {
    await upsertClientByName(c.name, {
      showTitle: c.showTitle || null,
      jobTitle: c.jobTitle || null,
      testimonial: c.testimonial || null,
      featured: !!c.featured,
      imageUrl: c.imageUrl || null,
    })
  }
}

async function importStaff() {
  const list = await fetchJSON('/api/staff').catch(() => [])
  for (const s of list || []) {
    await upsertStaffByName(s.name, {
      role: s.role || null,
      imageUrl: s.imageUrl || null,
    })
  }
}

async function importEquipment() {
  const list = await fetchJSON('/api/equipment').catch(() => [])
  for (const e of list || []) {
    await upsertEquipmentByName(e.name, {
      description: e.description || null,
      imageUrl: e.imageUrl || null,
    })
  }
}

async function importStudios() {
  const list = await fetchJSON('/api/studios').catch(() => [])
  for (const s of list || []) {
    const existing = await prisma.studio.findFirst({
      where: { name: s.name, location: s.location || 'Dubai' },
      select: { id: true },
    })
    const data = {
      name: s.name,
      location: s.location || 'Dubai',
      imageUrl: s.imageUrl || null,
      totalSeats: s.totalSeats || s.capacity || 1,
      openingTime: s.openingTime || '09:00',
      closingTime: s.closingTime || '18:00',
      isActive: s.isActive !== false,
      gallery: Array.isArray(s.gallery) ? s.gallery : [],
    }
    if (existing) {
      await prisma.studio.update({ where: { id: existing.id }, data })
    } else {
      await prisma.studio.create({ data })
    }
  }
}

async function importAdditionalServices() {
  const list = await fetchJSON('/api/add-services').catch(() => [])
  for (const a of list || []) {
    const name = a.name || a.title
    if (!name) continue
    const existing = await prisma.additionalService.findFirst({
      where: { name },
      select: { id: true },
    })
    const data = {
      name,
      description: a.description || null,
      price: a.price || 0,
      currency: a.currency || 'AED',
      count: a.count || 1,
      imageUrls: Array.isArray(a.imageUrls) ? a.imageUrls : [],
      type: a.type === 'BY_THREE' ? 'BY_THREE' : 'STANDARD',
    }
    if (existing) {
      await prisma.additionalService.update({
        where: { id: existing.id },
        data,
      })
    } else {
      await prisma.additionalService.create({ data })
    }
  }
}

async function importPackages() {
  const res = await fetchJSON('/api/packages').catch(() => null)
  const list = Array.isArray(res?.packages) ? res.packages : res || []
  for (const p of list) {
    const name = p.name
    const existing = await prisma.package.findFirst({
      where: { name },
      select: { id: true },
    })
    const data = {
      name,
      description: p.description || null,
      basePrice: parseFloat(p.pricePerHour || p.basePrice || 0),
      currency: p.currency || 'AED',
    }
    if (existing) {
      await prisma.package.update({ where: { id: existing.id }, data })
    } else {
      await prisma.package.create({ data })
    }
  }
}

async function importServices() {
  // Public endpoint exists at /api/services
  const list = await fetchJSON('/api/services').catch(() => [])
  for (const svc of list || []) {
    const name = svc.name
    if (!name) continue
    // Resolve serviceType by name if provided
    let serviceTypeId = null
    if (svc.serviceType?.name) {
      serviceTypeId = await upsertServiceTypeByName(
        svc.serviceType.name,
        svc.serviceType.description || null
      )
    }
    const existing = await prisma.service.findFirst({
      where: { name },
      select: { id: true },
    })
    const data = {
      name,
      description: svc.description || null,
      includes: Array.isArray(svc.includes) ? svc.includes : [],
      imageUrl: svc.imageUrl || null,
      serviceTypeId,
      isPopular: !!svc.isPopular,
      isActive: svc.isActive !== false,
      price: typeof svc.price === 'string' ? svc.price : Number(svc.price || 0),
      currency: svc.currency || 'AED',
    }
    if (existing) {
      await prisma.service.update({ where: { id: existing.id }, data })
    } else {
      await prisma.service.create({ data })
    }
  }
}

async function importServiceTypesFromSamples(samples) {
  for (const s of samples) {
    if (s.serviceType?.name) {
      await upsertServiceTypeByName(
        s.serviceType.name,
        s.serviceType.description || null
      )
    }
  }
}

async function importSamples() {
  const list = await fetchJSON('/api/samples').catch(() => [])
  await importServiceTypesFromSamples(list)
  for (const s of list || []) {
    const name = s.name
    const existing = await prisma.sample.findFirst({
      where: { name },
      select: { id: true },
    })
    let serviceTypeId = null
    if (s.serviceType?.name) {
      serviceTypeId = await upsertServiceTypeByName(
        s.serviceType.name,
        s.serviceType.description || null
      )
    }
    const data = {
      name,
      thumbUrl: s.thumbUrl || null,
      videoUrl: s.videoUrl || null,
      serviceTypeId,
    }
    if (existing) {
      await prisma.sample.update({ where: { id: existing.id }, data })
    } else {
      await prisma.sample.create({ data })
    }
  }
}

async function importCaseStudies() {
  const list = await fetchJSON('/api/case-studies').catch(() => [])
  for (const c of list || []) {
    const title = c.title
    const existing = await prisma.caseStudy.findFirst({
      where: { title },
      select: { id: true },
    })
    let clientId = null
    if (c.client?.name) {
      clientId = await upsertClientByName(c.client.name, {
        showTitle: c.client.showTitle || null,
        jobTitle: c.client.jobTitle || null,
        testimonial: c.client.testimonial || null,
        featured: !!c.client.featured,
        imageUrl: c.client.imageUrl || null,
      })
    }
    // prepare relations
    const connectStaff = []
    for (const st of c.staff || []) {
      const id = await upsertStaffByName(st.name, {
        role: st.role || null,
        imageUrl: st.imageUrl || null,
      })
      if (id) connectStaff.push({ id })
    }
    const connectEquipment = []
    for (const eq of c.equipment || []) {
      const id = await upsertEquipmentByName(eq.name, {
        description: eq.description || null,
        imageUrl: eq.imageUrl || null,
      })
      if (id) connectEquipment.push({ id })
    }
    const data = {
      title,
      tagline: c.tagline || null,
      mainText: c.mainText || null,
      isActive: c.isActive !== false,
      imageUrls: Array.isArray(c.imageUrls) ? c.imageUrls : [],
      clientId: clientId || null,
    }
    let caseId
    if (existing) {
      caseId = (
        await prisma.caseStudy.update({
          where: { id: existing.id },
          data,
          select: { id: true },
        })
      ).id
    } else {
      caseId = (await prisma.caseStudy.create({ data, select: { id: true } }))
        .id
    }
    // sync caseContent by unique (title, order)
    for (const content of c.caseContent || []) {
      const where = {
        caseStudyId: caseId,
        title: content.title || '',
        order: content.order ?? 0,
      }
      const has = await prisma.caseStudyContent.findFirst({
        where,
        select: { id: true },
      })
      const cd = {
        caseStudyId: caseId,
        title: content.title || '',
        text: Array.isArray(content.text) ? content.text : [],
        list: Array.isArray(content.list) ? content.list : [],
        imageUrl: content.imageUrl || '',
        order: content.order ?? 0,
      }
      if (has) {
        await prisma.caseStudyContent.update({
          where: { id: has.id },
          data: cd,
        })
      } else {
        await prisma.caseStudyContent.create({ data: cd })
      }
    }
    // connect staff and equipment
    await prisma.caseStudy.update({
      where: { id: caseId },
      data: {
        staff: { set: [], connect: connectStaff },
        equipment: { set: [], connect: connectEquipment },
      },
    })
  }
}

async function importBlog() {
  const list = await fetchJSON('/api/blog').catch(() => [])
  for (const b of list || []) {
    const existing = await prisma.blogRecord.findFirst({
      where: { title: b.title },
      select: { id: true },
    })
    const data = {
      title: b.title,
      tagline: b.tagline || '',
      mainText: b.mainText || '',
    }
    if (existing) {
      await prisma.blogRecord.update({ where: { id: existing.id }, data })
    } else {
      await prisma.blogRecord.create({ data })
    }
  }
}

async function importDiscountCodes() {
  const list = await fetchJSON('/api/discount-codes').catch(() => [])
  for (const d of list || []) {
    const existing = await prisma.discountCode.findFirst({
      where: { code: d.code },
      select: { id: true },
    })
    const data = {
      code: d.code,
      type: d.type === 'PERCENTAGE' ? 'PERCENTAGE' : 'FIXED_AMOUNT',
      value: Number(d.value || 0),
      currency: d.currency || 'AED',
      isActive: d.isActive !== false,
      startDate: d.startDate ? new Date(d.startDate) : new Date(),
      endDate: d.endDate
        ? new Date(d.endDate)
        : new Date(Date.now() + 86400000),
      usageLimit: d.usageLimit ?? null,
      usedCount: d.usedCount ?? 0,
      firstTimeOnly: !!d.firstTimeOnly,
      minOrderAmount: d.minOrderAmount ? Number(d.minOrderAmount) : null,
      applicableContentTypes: Array.isArray(d.applicableContentTypes)
        ? d.applicableContentTypes
        : [],
    }
    if (existing) {
      await prisma.discountCode.update({ where: { id: existing.id }, data })
    } else {
      await prisma.discountCode.create({ data })
    }
  }
}

async function main() {
  if (!SOURCE) {
    console.log('STAGE_SEED_SOURCE_URL is not set. Skipping remote import.')
    return
  }
  console.log(`Importing dynamic content from ${SOURCE} ...`)
  try {
    await importClients()
    await importStaff()
    await importEquipment()
    await importStudios()
    await importAdditionalServices()
    await importServices()
    await importPackages()
    await importSamples()
    await importCaseStudies()
    await importBlog()
    await importDiscountCodes()
    console.log('✅ Remote content imported successfully.')
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(err => {
  console.error('❌ Import error:', err)
  process.exit(1)
})
