const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  try {
    // Seed Studios
    console.log('📊 Seeding studios...')
    const studiosData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'studios.json'), 'utf8')
    )

    for (const studio of studiosData) {
      await prisma.studio.create({
        data: {
          name: studio.name,
          location: studio.location,
          imageUrl: studio.imageUrl,
          totalSeats: studio.totalSeats,
          openingTime: studio.openingTime,
          closingTime: studio.closingTime,
        },
      })
    }
    console.log(`✅ Created ${studiosData.length} studios`)

    // Seed Packages
    console.log('📦 Seeding packages...')
    const packagesData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'pacage.json'), 'utf8')
    )

    for (const pkg of packagesData) {
      await prisma.package.create({
        data: {
          name: pkg.name,
          description: pkg.description,
          basePrice: pkg.price_per_hour || pkg.price,
          currency: pkg.currency || 'AED',
        },
      })
    }
    console.log(`✅ Created ${packagesData.length} packages`)

    // Seed Additional Services
    console.log('🔧 Seeding additional services...')
    const additionalServicesData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'additionalService.json'), 'utf8')
    )

    for (const service of additionalServicesData) {
      await prisma.additionalService.create({
        data: {
          name: service.title || service.name,
          description: service.description,
          price: service.price,
          currency: service.currency || 'AED',
          imageUrls: service.imageUrls || [],
          type: service.type === 'STANDARD' ? 'STANDARD' : 'BY_THREE',
        },
      })
    }
    console.log(
      `✅ Created ${additionalServicesData.length} additional services`
    )

    // Seed Sample Case Study
    console.log('📝 Seeding sample case study...')
    const sampleClient = await prisma.client.create({
      data: {
        name: 'Margarita',
        jobTitle: 'Podcaster',
        showTitle: "Margarita's Podcast",
        testimonial: 'The team helped me launch my podcast successfully!',
        featured: true,
        imageUrl: null,
      },
    })

    const sampleCaseStudy = await prisma.caseStudy.create({
      data: {
        title: "From Idea to Income: Margarita's Podcast Success",
        tagline:
          'How a first-time podcaster turned her idea into a $1,000+ per episode business',
        mainText:
          'Margarita came to us with a bold idea but no experience in podcasting. Within weeks, she was generating income from her professional video podcast.',
        content: JSON.stringify([
          {
            title: 'Challenge',
            text: [
              'Margarita had a bold idea: she wanted to start her own podcast.',
              'The difficulty was that she had no background in podcasting, video production, or editing — and no clear understanding of how podcasts could be monetized.',
              'She needed guidance and a professional setup to turn her idea into something real and profitable.',
            ],
          },
          {
            title: 'Solution',
            text: [
              'We provided a turnkey podcast production service, taking care of everything from concept development and filming to editing and final delivery.',
              'Each episode was produced as a polished video podcast, ready to publish. By handling the technical side — filming, editing, and post-production — we gave Margarita the freedom to focus on her content and her guests.',
              'Within just a few weeks, she had four high-quality episodes live.',
            ],
          },
          {
            title: 'Result',
            text: [
              'The impact was immediate.',
              "By her **fifth episode**, Margarita's podcast was already generating income.",
              'Thanks to her growing media presence and the professional look of her show, guests recognized the value of being featured and began paying for the opportunity.',
              'Today, Margarita **earns at least $1,000 per episode** from guest appearances — turning her podcast into both a creative outlet and a reliable business model.',
            ],
          },
          {
            title: 'Key Takeaways',
            list: [
              'A first-time podcaster successfully launched a professional video podcast from scratch.',
              'Full-cycle podcast production (filming, editing, post-production) ensured high quality and consistency.',
              'Podcast monetization started by episode five, with $1,000+ per guest appearance.',
              'Turnkey production services let creators focus on building content, brand, and audience.',
            ],
          },
        ]),
        imageUrls: ['/assets/images/case-banner.jpg'],
        clientId: sampleClient.id,
      },
    })

    // Seed Case Study Content (new table)
    console.log('📋 Seeding case study content...')
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

    for (const content of caseContentData) {
      await prisma.caseStudyContent.create({
        data: {
          caseStudyId: sampleCaseStudy.id,
          title: content.title,
          text: content.text,
          list: content.list,
          imageUrl: content.imageUrl,
          order: content.order,
        },
      })
    }
    console.log(
      `✅ Created ${caseContentData.length} case study content sections`
    )

    // Seed Service Types first
    console.log('🏷️ Seeding service types...')
    const serviceTypes = [
      {
        name: 'Recording',
        description: 'Professional recording services',
      },
      {
        name: 'Editing',
        description: 'Post-production editing services',
      },
      {
        name: 'Live Streaming',
        description: 'Live streaming and broadcast services',
      },
    ]

    const createdServiceTypes = []
    for (const serviceType of serviceTypes) {
      const created = await prisma.serviceType.create({
        data: serviceType,
      })
      createdServiceTypes.push(created)
    }
    console.log(`✅ Created ${createdServiceTypes.length} service types`)

    // Seed Samples with service type relations
    console.log('🎬 Seeding samples...')
    const samplesData = [
      {
        name: 'Podcast Recording Sample',
        thumbUrl: '/assets/images/podcast-sample-thumb.jpg',
        videoUrl: '/videos/podcast-sample.mp4',
        serviceTypeId: createdServiceTypes[0].id, // Recording
      },
      {
        name: 'Video Editing Sample',
        thumbUrl: '/assets/images/editing-sample-thumb.jpg',
        videoUrl: '/videos/editing-sample.mp4',
        serviceTypeId: createdServiceTypes[1].id, // Editing
      },
      {
        name: 'Live Stream Sample',
        thumbUrl: '/assets/images/live-sample-thumb.jpg',
        videoUrl: '/videos/live-sample.mp4',
        serviceTypeId: createdServiceTypes[2].id, // Live Streaming
      },
      {
        name: 'Corporate Video Sample',
        thumbUrl: '/assets/images/corporate-sample-thumb.jpg',
        videoUrl: '/videos/corporate-sample.mp4',
        serviceTypeId: createdServiceTypes[0].id, // Recording
      },
    ]

    for (const sample of samplesData) {
      await prisma.sample.create({
        data: sample,
      })
    }
    console.log(`✅ Created ${samplesData.length} samples`)

    console.log('🎉 Database seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
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
