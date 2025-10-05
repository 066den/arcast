const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function backupDatabase() {
  try {
    console.log('🔄 Starting database backup...')

    // Get all data from all tables
    const backup = {
      timestamp: new Date().toISOString(),
      studios: await prisma.studio.findMany(),
      serviceTypes: await prisma.serviceType.findMany(),
      services: await prisma.service.findMany(),
      packages: await prisma.package.findMany(),
      clients: await prisma.client.findMany(),
      caseStudies: await prisma.caseStudy.findMany({
        include: {
          client: true,
          caseContent: true,
          staff: true,
          equipment: true,
        },
      }),
      caseStudyContent: await prisma.caseStudyContent.findMany(),
      equipment: await prisma.equipment.findMany(),
      staff: await prisma.staff.findMany(),
      samples: await prisma.sample.findMany(),
      additionalServices: await prisma.additionalService.findMany(),
      discountCodes: await prisma.discountCode.findMany(),
      leads: await prisma.lead.findMany(),
      bookings: await prisma.booking.findMany({
        include: {
          studio: true,
          contentPackage: true,
          service: true,
          lead: true,
          discountCode: true,
          bookingAdditionalServices: true,
          payment: true,
        },
      }),
      payments: await prisma.payment.findMany(),
      orders: await prisma.order.findMany({
        include: {
          lead: true,
          discountCode: true,
          payment: true,
        },
      }),
      orderPayments: await prisma.orderPayment.findMany(),
      blogRecords: await prisma.blogRecord.findMany(),
    }

    // Create backup directory if it doesn't exist
    const backupDir = path.join(__dirname, '..', 'backups')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `backup-${timestamp}.json`
    const filepath = path.join(backupDir, filename)

    // Write backup to file
    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2))

    console.log(`✅ Database backup completed successfully!`)
    console.log(`📁 Backup saved to: ${filepath}`)
    console.log(`📊 Records backed up:`)
    console.log(`   - Studios: ${backup.studios.length}`)
    console.log(`   - Services: ${backup.services.length}`)
    console.log(`   - Packages: ${backup.packages.length}`)
    console.log(`   - Case Studies: ${backup.caseStudies.length}`)
    console.log(`   - Clients: ${backup.clients.length}`)
    console.log(`   - Bookings: ${backup.bookings.length}`)
    console.log(`   - Orders: ${backup.orders.length}`)
    console.log(`   - Payments: ${backup.payments.length}`)
    console.log(`   - Order Payments: ${backup.orderPayments.length}`)
  } catch (error) {
    console.error('❌ Error creating backup:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run backup if this script is executed directly
if (require.main === module) {
  backupDatabase()
}

module.exports = { backupDatabase }
