const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

function readJson(file) {
  const p = path.join(__dirname, file)
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

function slugify(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-')
}

// Deduplicate helper: keep one row per natural key, delete the rest
async function dedupe() {
  // Studios: key(name, location)
  await prisma.$executeRawUnsafe(`
    DELETE FROM studios s
    USING (
      SELECT MIN(id) AS keep_id, name, location
      FROM studios
      GROUP BY name, location
    ) k
    WHERE s.name = k.name AND s.location = k.location AND s.id <> k.keep_id;
  `)

  // Packages: key(name)
  await prisma.$executeRawUnsafe(`
    DELETE FROM packages p
    USING (
      SELECT MIN(id) AS keep_id, name
      FROM packages
      GROUP BY name
    ) k
    WHERE p.name = k.name AND p.id <> k.keep_id;
  `)

  // Additional services: key(name)
  await prisma.$executeRawUnsafe(`
    DELETE FROM additional_services a
    USING (
      SELECT MIN(id) AS keep_id, name
      FROM additional_services
      GROUP BY name
    ) k
    WHERE a.name = k.name AND a.id <> k.keep_id;
  `)

  // Samples: key(name)
  await prisma.$executeRawUnsafe(`
    DELETE FROM samples s
    USING (
      SELECT MIN(id) AS keep_id, name
      FROM samples
      GROUP BY name
    ) k
    WHERE s.name = k.name AND s.id <> k.keep_id;
  `)

  // Case studies: key(title)
  await prisma.$executeRawUnsafe(`
    DELETE FROM case_studies cs
    USING (
      SELECT MIN(id) AS keep_id, title
      FROM case_studies
      GROUP BY title
    ) k
    WHERE cs.title = k.title AND cs.id <> k.keep_id;
  `)

  // Case study content: key(caseStudyId, title, "order")
  await prisma.$executeRawUnsafe(`
    DELETE FROM case_study_content c
    USING (
      SELECT MIN(id) AS keep_id, "caseStudyId", title, "order"
      FROM case_study_content
      GROUP BY "caseStudyId", title, "order"
    ) k
    WHERE c."caseStudyId" = k."caseStudyId"
      AND c.title = k.title
      AND c."order" = k."order"
      AND c.id <> k.keep_id;
  `)
}

async function seedStudios() {
  console.log('📊 Seeding studios (idempotent)...')
  const studiosData = readJson('studios.json')
  for (const s of studiosData) {
    const name = s.name?.trim()
    const location = (s.location || 'Dubai').trim()
    const existing = await prisma.studio.findFirst({
      where: { name, location },
      select: { id: true },
    })
    const data = {
      name,
      location,
      imageUrl: s.imageUrl || null,
      totalSeats: s.totalSeats,
      openingTime: s.openingTime,
      closingTime: s.closingTime,
    }
    if (existing) {
      await prisma.studio.update({ where: { id: existing.id }, data })
    } else {
      await prisma.studio.create({ data })
    }
  }
  console.log(`✅ Studios upserted: ${studiosData.length}`)
}

async function seedPackages() {
  console.log('📦 Seeding packages (idempotent)...')
  const packagesData = readJson('pacage.json') // NOTE: file name is "pacage.json"
  for (const pkg of packagesData) {
    const name = pkg.name?.trim()
    const existing = await prisma.package.findFirst({
      where: { name },
      select: { id: true },
    })
    const data = {
      name,
      description: pkg.description || null,
      basePrice: pkg.price_per_hour || pkg.price,
      currency: pkg.currency || 'AED',
    }
    if (existing) {
      await prisma.package.update({ where: { id: existing.id }, data })
    } else {
      await prisma.package.create({ data })
    }
  }
  console.log(`✅ Packages upserted: ${packagesData.length}`)
}

async function seedAdditionalServices() {
  console.log('🔧 Seeding additional services (idempotent)...')
  const additionalServicesData = readJson('additionalService.json')
  for (const service of additionalServicesData) {
    const name = (service.title || service.name || '').trim()
    const existing = await prisma.additionalService.findFirst({
      where: { name },
      select: { id: true },
    })
    const data = {
      name,
      description: service.description || null,
      price: service.price,
      currency: service.currency || 'AED',
      imageUrls: service.imageUrls || [],
      type: service.type === 'STANDARD' ? 'STANDARD' : 'BY_THREE',
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
  console.log(
    `✅ Additional services upserted: ${additionalServicesData.length}`
  )
}

async function seedCaseStudyAndContent() {
  console.log('📝 Seeding sample case study (idempotent)...')
  const title = "From Idea to Income: Margarita's Podcast Success"

  let caseStudy = await prisma.caseStudy.findFirst({
    where: { title },
    select: { id: true },
  })

  if (!caseStudy) {
    const sampleClient = await prisma.client.create({
      data: {
        name: 'Margarita',
        jobTitle: 'Podcaster',
        showTitle: "Margarita's Podcast",
        testimonial: 'The team helped me launch my podcast successfully!',
        featured: true,
        imageUrl: null,
      },
      select: { id: true },
    })

    caseStudy = await prisma.caseStudy.create({
      data: {
        title,
        tagline:
          'How a first-time podcaster turned her idea into a $1,000+ per episode business',
        mainText:
          'Margarita came to us with a bold idea but no experience in podcasting. Within weeks, she was generating income from her professional video podcast.',
        imageUrls: ['/assets/images/case-banner.jpg'],
        clientId: sampleClient.id,
      },
      select: { id: true },
    })
  }

  const caseStudyId = caseStudy.id

  const caseContentData = [
    {
      title: 'Challenge',
      text: [
        'Margarita had a bold idea: she wanted to start her own podcast.',
        'The difficulty was that she had no background in podcasting, video production, or editing — and no clear understanding of how podcasts could be monetized.',
        'She needed guidance and a professional setup to turn her idea into something real and profitable.',
      ],
      list: [],
      imageUrl: '/assets/images/challenge.jpg',
      order: 1,
    },
    {
      title: 'Solution',
      text: [
        'We provided a turnkey podcast production service, taking care of everything from concept development and filming to editing and final delivery.',
        'Each episode was produced as a polished video podcast, ready to publish. By handling the technical side — filming, editing, and post-production — we gave Margarita the freedom to focus on her content and her guests.',
        'Within just a few weeks, she had four high-quality episodes live.',
      ],
      list: [],
      imageUrl: '/assets/images/solution.jpg',
      order: 2,
    },
    {
      title: 'Result',
      text: [
        'The impact was immediate.',
        "By her **fifth episode**, Margarita's podcast was already generating income.",
        'Thanks to her growing media presence and the professional look of her show, guests recognized the value of being featured and began paying for the opportunity.',
        'Today, Margarita **earns at least $1,000 per episode** from guest appearances — turning her podcast into both a creative outlet and a reliable business model.',
      ],
      list: [],
      imageUrl: '/assets/images/result.jpg',
      order: 3,
    },
    {
      title: 'Key Takeaways',
      text: [],
      list: [
        'A first-time podcaster successfully launched a professional video podcast from scratch.',
        'Full-cycle podcast production (filming, editing, post-production) ensured high quality and consistency.',
        'Podcast monetization started by episode five, with $1,000+ per guest appearance.',
        'Turnkey production services let creators focus on building content, brand, and audience.',
      ],
      imageUrl: '/assets/images/takeaways.jpg',
      order: 4,
    },
  ]

  for (const c of caseContentData) {
    const exists = await prisma.caseStudyContent.findFirst({
      where: { caseStudyId, title: c.title, order: c.order },
      select: { id: true },
    })
    const data = {
      caseStudyId,
      title: c.title,
      text: c.text,
      list: c.list,
      imageUrl: c.imageUrl,
      order: c.order,
    }
    if (exists) {
      await prisma.caseStudyContent.update({ where: { id: exists.id }, data })
    } else {
      await prisma.caseStudyContent.create({ data })
    }
  }

  console.log('✅ Case study and content upserted')
}

async function seedServiceTypesAndSamples() {
  console.log('🏷️ Seeding service types (idempotent)...')
  const serviceTypes = [
    {
      name: 'Podcast Production',
      description: 'Professional recording services',
    },
    {
      name: 'Reels Production',
      description: 'Post-production editing services',
    },
    {
      name: 'Media post-production',
      description: 'Live streaming and broadcast services',
    },
    {
      name: 'Social media management',
      description: 'Social media strategy and content creation',
    },
    {
      name: 'Beneficial packages',
      description: 'Video production for marketing and branding',
    },
  ]

  const createdServiceTypes = []
  for (const st of serviceTypes) {
    const where = { name: st.name }
    const data = {
      name: st.name,
      description: st.description,
      slug: slugify(st.name),
    }
    const created = await prisma.serviceType.upsert({
      where,
      update: data,
      create: data,
      select: { id: true, name: true },
    })
    createdServiceTypes.push(created)
  }
  console.log(`✅ Service types upserted: ${createdServiceTypes.length}`)

  console.log('🎬 Seeding samples (idempotent)...')
  const samplesData = [
    {
      name: 'Podcast Recording Sample',
      thumbUrl: '/assets/images/podcast-sample-thumb.jpg',
      videoUrl: '/videos/podcast-sample.mp4',
      serviceTypeId: createdServiceTypes[0]?.id,
    },
    {
      name: 'Video Editing Sample',
      thumbUrl: '/assets/images/editing-sample-thumb.jpg',
      videoUrl: '/videos/editing-sample.mp4',
      serviceTypeId: createdServiceTypes[1]?.id,
    },
    {
      name: 'Live Stream Sample',
      thumbUrl: '/assets/images/live-sample-thumb.jpg',
      videoUrl: '/videos/live-sample.mp4',
      serviceTypeId: createdServiceTypes[2]?.id,
    },
    {
      name: 'Corporate Video Sample',
      thumbUrl: '/assets/images/corporate-sample-thumb.jpg',
      videoUrl: '/videos/corporate-sample.mp4',
      serviceTypeId: createdServiceTypes[0]?.id,
    },
  ]

  for (const s of samplesData) {
    const name = s.name?.trim()
    const exists = await prisma.sample.findFirst({
      where: { name },
      select: { id: true },
    })
    const data = {
      name,
      thumbUrl: s.thumbUrl || null,
      videoUrl: s.videoUrl || null,
      serviceTypeId: s.serviceTypeId || null,
    }
    if (exists) {
      await prisma.sample.update({ where: { id: exists.id }, data })
    } else {
      await prisma.sample.create({ data })
    }
  }
  console.log(`✅ Samples upserted: ${samplesData.length}`)
}

async function main() {
  console.log('🌱 Starting database seeding (idempotent with dedup)...')

  try {
    await seedStudios()
    await seedPackages()
    await seedAdditionalServices()
    await seedCaseStudyAndContent()
    await seedServiceTypesAndSamples()

    // Cleanup accidental duplicates (if были ранее)
    await dedupe()

    console.log('🎉 Database seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
