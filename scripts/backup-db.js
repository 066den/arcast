const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function backupDatabase() {
  try {
    console.log('🔄 Начинаю создание бэкапа базы данных...')

    // Получение всех данных
    const [
      studios,
      serviceTypes,
      services,
      packages,
      servicePackageRecords,
      addServicePackageRecords,
      additionalServices,
      discountCodes,
      leads,
      bookings,
      bookingAdditionalServices,
      payments,
      orders,
      orderPayments,
      clients,
      staff,
      equipment,
      caseStudies,
      caseStudyContent,
      samples,
      blogRecords,
    ] = await Promise.all([
      prisma.studio.findMany(),
      prisma.serviceType.findMany(),
      prisma.service.findMany(),
      prisma.package.findMany(),
      prisma.servicePackageRecord.findMany(),
      prisma.addServicePackageRecord.findMany(),
      prisma.additionalService.findMany(),
      prisma.discountCode.findMany(),
      prisma.lead.findMany(),
      prisma.booking.findMany(),
      prisma.bookingAdditionalService.findMany(),
      prisma.payment.findMany(),
      prisma.order.findMany(),
      prisma.orderPayment.findMany(),
      prisma.client.findMany(),
      prisma.staff.findMany(),
      prisma.equipment.findMany(),
      prisma.caseStudy.findMany({
        include: {
          staff: true,
          equipment: true,
        },
      }),
      prisma.caseStudyContent.findMany(),
      prisma.sample.findMany(),
      prisma.blogRecord.findMany(),
    ])

    // Подготовка данных для бэкапа
    const backupData = {
      metadata: {
        timestamp: new Date().toISOString(),
        totalRecords:
          studios.length +
          serviceTypes.length +
          services.length +
          packages.length +
          servicePackageRecords.length +
          addServicePackageRecords.length +
          additionalServices.length +
          discountCodes.length +
          leads.length +
          bookings.length +
          bookingAdditionalServices.length +
          payments.length +
          orders.length +
          orderPayments.length +
          clients.length +
          staff.length +
          equipment.length +
          caseStudies.length +
          caseStudyContent.length +
          samples.length +
          blogRecords.length,
      },
      studios,
      serviceTypes,
      services,
      packages,
      servicePackageRecords,
      addServicePackageRecords,
      additionalServices,
      discountCodes,
      leads,
      bookings,
      bookingAdditionalServices,
      payments,
      orders,
      orderPayments,
      clients,
      staff,
      equipment,
      caseStudies,
      caseStudyContent,
      samples,
      blogRecords,
    }

    // Создание папки backups, если не существует
    const backupsDir = path.join(process.cwd(), 'backups')
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true })
    }

    // Имя файла с timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `backup-${timestamp}.json`
    const filepath = path.join(backupsDir, filename)

    // Сохранение бэкапа
    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2), 'utf8')

    console.log('\n✅ Бэкап создан успешно!')
    console.log(`📂 Файл: ${filepath}`)
    console.log(`📊 Всего записей: ${backupData.metadata.totalRecords}`)
    console.log(`\nРазбивка по таблицам:`)
    console.log(`   Studios: ${studios.length}`)
    console.log(`   Service Types: ${serviceTypes.length}`)
    console.log(`   Services: ${services.length}`)
    console.log(`   Packages: ${packages.length}`)
    console.log(`   Service Package Records: ${servicePackageRecords.length}`)
    console.log(
      `   Additional Service Package Records: ${addServicePackageRecords.length}`
    )
    console.log(`   Additional Services: ${additionalServices.length}`)
    console.log(`   Discount Codes: ${discountCodes.length}`)
    console.log(`   Leads: ${leads.length}`)
    console.log(`   Bookings: ${bookings.length}`)
    console.log(
      `   Booking Additional Services: ${bookingAdditionalServices.length}`
    )
    console.log(`   Payments: ${payments.length}`)
    console.log(`   Orders: ${orders.length}`)
    console.log(`   Order Payments: ${orderPayments.length}`)
    console.log(`   Clients: ${clients.length}`)
    console.log(`   Staff: ${staff.length}`)
    console.log(`   Equipment: ${equipment.length}`)
    console.log(`   Case Studies: ${caseStudies.length}`)
    console.log(`   Case Study Content: ${caseStudyContent.length}`)
    console.log(`   Samples: ${samples.length}`)
    console.log(`   Blog Records: ${blogRecords.length}`)
  } catch (error) {
    console.error('\n❌ Ошибка при создании бэкапа:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Запуск бэкапа
backupDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
