const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function restoreDatabase(backupFilePath) {
  try {
    console.log('🔄 Starting database restore...')

    // Check if backup file exists
    if (!fs.existsSync(backupFilePath)) {
      throw new Error(`Backup file not found: ${backupFilePath}`)
    }

    // Read backup file
    const backupData = JSON.parse(fs.readFileSync(backupFilePath, 'utf8'))

    console.log(`📁 Restoring from backup: ${backupFilePath}`)
    console.log(`📅 Backup created: ${backupData.timestamp}`)

    // Clear existing data (in correct order to respect foreign keys)
    console.log('🗑️  Clearing existing data...')
    await prisma.payment.deleteMany()
    await prisma.bookingAdditionalService.deleteMany()
    await prisma.booking.deleteMany()
    await prisma.lead.deleteMany()
    await prisma.discountCode.deleteMany()
    await prisma.additionalService.deleteMany()
    await prisma.sample.deleteMany()
    await prisma.caseStaff.deleteMany()
    await prisma.caseEquipment.deleteMany()
    await prisma.caseStudyContent.deleteMany()
    await prisma.caseStudy.deleteMany()
    await prisma.client.deleteMany()
    await prisma.servicePackageRecord.deleteMany()
    await prisma.addServicePackageRecord.deleteMany()
    await prisma.package.deleteMany()
    await prisma.service.deleteMany()
    await prisma.serviceType.deleteMany()
    await prisma.studio.deleteMany()
    await prisma.equipment.deleteMany()
    await prisma.staff.deleteMany()
    await prisma.blogRecord.deleteMany()

    // Restore data (in correct order)
    console.log('📥 Restoring data...')

    if (backupData.studios?.length > 0) {
      await prisma.studio.createMany({ data: backupData.studios })
      console.log(`   ✅ Studios: ${backupData.studios.length}`)
    }

    if (backupData.serviceTypes?.length > 0) {
      await prisma.serviceType.createMany({ data: backupData.serviceTypes })
      console.log(`   ✅ Service Types: ${backupData.serviceTypes.length}`)
    }

    if (backupData.services?.length > 0) {
      await prisma.service.createMany({ data: backupData.services })
      console.log(`   ✅ Services: ${backupData.services.length}`)
    }

    if (backupData.packages?.length > 0) {
      await prisma.package.createMany({ data: backupData.packages })
      console.log(`   ✅ Packages: ${backupData.packages.length}`)
    }

    if (backupData.clients?.length > 0) {
      await prisma.client.createMany({ data: backupData.clients })
      console.log(`   ✅ Clients: ${backupData.clients.length}`)
    }

    if (backupData.equipment?.length > 0) {
      await prisma.equipment.createMany({ data: backupData.equipment })
      console.log(`   ✅ Equipment: ${backupData.equipment.length}`)
    }

    if (backupData.staff?.length > 0) {
      await prisma.staff.createMany({ data: backupData.staff })
      console.log(`   ✅ Staff: ${backupData.staff.length}`)
    }

    if (backupData.caseStudyContent?.length > 0) {
      await prisma.caseStudyContent.createMany({
        data: backupData.caseStudyContent,
      })
      console.log(
        `   ✅ Case Study Content: ${backupData.caseStudyContent.length}`
      )
    }

    if (backupData.caseStudies?.length > 0) {
      // Remove relations before creating
      const caseStudiesData = backupData.caseStudies.map(cs => ({
        id: cs.id,
        clientId: cs.clientId,
        title: cs.title,
        tagline: cs.tagline,
        mainText: cs.mainText,
        isActive: cs.isActive,
        imageUrls: cs.imageUrls,
      }))
      await prisma.caseStudy.createMany({ data: caseStudiesData })
      console.log(`   ✅ Case Studies: ${backupData.caseStudies.length}`)
    }

    if (backupData.additionalServices?.length > 0) {
      await prisma.additionalService.createMany({
        data: backupData.additionalServices,
      })
      console.log(
        `   ✅ Additional Services: ${backupData.additionalServices.length}`
      )
    }

    if (backupData.discountCodes?.length > 0) {
      await prisma.discountCode.createMany({ data: backupData.discountCodes })
      console.log(`   ✅ Discount Codes: ${backupData.discountCodes.length}`)
    }

    if (backupData.leads?.length > 0) {
      await prisma.lead.createMany({ data: backupData.leads })
      console.log(`   ✅ Leads: ${backupData.leads.length}`)
    }

    if (backupData.samples?.length > 0) {
      await prisma.sample.createMany({ data: backupData.samples })
      console.log(`   ✅ Samples: ${backupData.samples.length}`)
    }

    if (backupData.blogRecords?.length > 0) {
      await prisma.blogRecord.createMany({ data: backupData.blogRecords })
      console.log(`   ✅ Blog Records: ${backupData.blogRecords.length}`)
    }

    // Restore bookings and related data
    if (backupData.bookings?.length > 0) {
      // Remove relations before creating
      const bookingsData = backupData.bookings.map(booking => ({
        id: booking.id,
        startTime: new Date(booking.startTime),
        endTime: new Date(booking.endTime),
        numberOfSeats: booking.numberOfSeats,
        totalCost: booking.totalCost,
        vatAmount: booking.vatAmount,
        discountAmount: booking.discountAmount,
        finalAmount: booking.finalAmount,
        status: booking.status,
        createdAt: new Date(booking.createdAt),
        updatedAt: new Date(booking.updatedAt),
        studioId: booking.studioId,
        contentPackageId: booking.contentPackageId,
        serviceId: booking.serviceId,
        leadId: booking.leadId,
        discountCodeId: booking.discountCodeId,
      }))
      await prisma.booking.createMany({ data: bookingsData })
      console.log(`   ✅ Bookings: ${backupData.bookings.length}`)
    }

    if (backupData.payments?.length > 0) {
      const paymentsData = backupData.payments.map(payment => ({
        id: payment.id,
        bookingId: payment.bookingId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        provider: payment.provider,
        externalId: payment.externalId,
        paymentLinkId: payment.paymentLinkId,
        metadata: payment.metadata,
        completedAt: payment.completedAt ? new Date(payment.completedAt) : null,
        refundedAt: payment.refundedAt ? new Date(payment.refundedAt) : null,
        createdAt: new Date(payment.createdAt),
        updatedAt: new Date(payment.updatedAt),
      }))
      await prisma.payment.createMany({ data: paymentsData })
      console.log(`   ✅ Payments: ${backupData.payments.length}`)
    }

    console.log('✅ Database restore completed successfully!')
  } catch (error) {
    console.error('❌ Error restoring database:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run restore if this script is executed directly
if (require.main === module) {
  const backupFile = process.argv[2]
  if (!backupFile) {
    console.error('❌ Please provide backup file path as argument')
    console.log('Usage: node restore-db.js <backup-file-path>')
    process.exit(1)
  }
  restoreDatabase(backupFile)
}

module.exports = { restoreDatabase }
