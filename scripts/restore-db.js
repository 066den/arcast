const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function restoreDatabase(filePath) {
  try {
    console.log('🔄 Начинаю восстановление базы данных...')
    console.log(`📂 Файл: ${filePath}`)

    // Проверка существования файла
    if (!fs.existsSync(filePath)) {
      throw new Error(`Файл не найден: ${filePath}`)
    }

    // Чтение бэкапа
    const backupData = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    console.log(`📊 Метаданные бэкапа:`)
    console.log(`   Создан: ${backupData.timestamp || 'Неизвестно'}`)

    // Подсчет общего количества записей
    const totalRecords = Object.keys(backupData)
      .filter(key => Array.isArray(backupData[key]))
      .reduce((sum, key) => sum + backupData[key].length, 0)
    console.log(`   Записей: ${totalRecords}`)

    // Очистка базы данных (в обратном порядке из-за зависимостей)
    console.log('\n🗑️  Очистка базы данных...')

    await prisma.orderPayment.deleteMany({})
    await prisma.order.deleteMany({})
    await prisma.payment.deleteMany({})
    await prisma.bookingAdditionalService.deleteMany({})
    await prisma.booking.deleteMany({})
    await prisma.lead.deleteMany({})
    await prisma.servicePackageRecord.deleteMany({})
    await prisma.addServicePackageRecord.deleteMany({})
    await prisma.package.deleteMany({})
    await prisma.discountCode.deleteMany({})
    await prisma.additionalService.deleteMany({})
    await prisma.service.deleteMany({})
    await prisma.serviceType.deleteMany({})
    await prisma.studio.deleteMany({})
    await prisma.caseStudyContent.deleteMany({})
    await prisma.caseStudy.deleteMany({})
    await prisma.client.deleteMany({})
    await prisma.staff.deleteMany({})
    await prisma.equipment.deleteMany({})
    await prisma.sample.deleteMany({})
    await prisma.blogRecord.deleteMany({})

    console.log('✅ База данных очищена')

    // Восстановление данных
    console.log('\n📥 Восстановление данных...')

    // Восстановление в правильном порядке
    if (backupData.studios?.length > 0) {
      await prisma.studio.createMany({ data: backupData.studios })
      console.log(`   ✓ Studios: ${backupData.studios.length}`)
    }

    if (backupData.serviceTypes?.length > 0) {
      await prisma.serviceType.createMany({ data: backupData.serviceTypes })
      console.log(`   ✓ Service Types: ${backupData.serviceTypes.length}`)
    }

    if (backupData.services?.length > 0) {
      await prisma.service.createMany({ data: backupData.services })
      console.log(`   ✓ Services: ${backupData.services.length}`)
    }

    if (backupData.packages?.length > 0) {
      await prisma.package.createMany({ data: backupData.packages })
      console.log(`   ✓ Packages: ${backupData.packages.length}`)
    }

    if (backupData.servicePackageRecords?.length > 0) {
      await prisma.servicePackageRecord.createMany({
        data: backupData.servicePackageRecords,
      })
      console.log(
        `   ✓ Service Package Records: ${backupData.servicePackageRecords.length}`
      )
    }

    if (backupData.addServicePackageRecords?.length > 0) {
      await prisma.addServicePackageRecord.createMany({
        data: backupData.addServicePackageRecords,
      })
      console.log(
        `   ✓ Additional Service Package Records: ${backupData.addServicePackageRecords.length}`
      )
    }

    if (backupData.additionalServices?.length > 0) {
      await prisma.additionalService.createMany({
        data: backupData.additionalServices,
      })
      console.log(
        `   ✓ Additional Services: ${backupData.additionalServices.length}`
      )
    }

    if (backupData.discountCodes?.length > 0) {
      await prisma.discountCode.createMany({ data: backupData.discountCodes })
      console.log(`   ✓ Discount Codes: ${backupData.discountCodes.length}`)
    }

    if (backupData.leads?.length > 0) {
      await prisma.lead.createMany({ data: backupData.leads })
      console.log(`   ✓ Leads: ${backupData.leads.length}`)
    }

    if (backupData.bookings?.length > 0) {
      // Очистка вложенных объектов из bookings
      const cleanBookings = backupData.bookings.map(booking => ({
        id: booking.id,
        startTime: booking.startTime,
        endTime: booking.endTime,
        numberOfSeats: booking.numberOfSeats,
        totalCost: booking.totalCost,
        vatAmount: booking.vatAmount,
        discountAmount: booking.discountAmount,
        finalAmount: booking.finalAmount,
        status: booking.status,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        studioId: booking.studioId,
        contentPackageId: booking.contentPackageId,
        serviceId: booking.serviceId,
        leadId: booking.leadId,
        discountCodeId: booking.discountCodeId,
      }))
      await prisma.booking.createMany({ data: cleanBookings })
      console.log(`   ✓ Bookings: ${cleanBookings.length}`)
    }

    if (backupData.bookingAdditionalServices?.length > 0) {
      await prisma.bookingAdditionalService.createMany({
        data: backupData.bookingAdditionalServices,
      })
      console.log(
        `   ✓ Booking Additional Services: ${backupData.bookingAdditionalServices.length}`
      )
    }

    if (backupData.payments?.length > 0) {
      await prisma.payment.createMany({ data: backupData.payments })
      console.log(`   ✓ Payments: ${backupData.payments.length}`)
    }

    if (backupData.orders?.length > 0) {
      // Очистка вложенных объектов из orders
      const cleanOrders = backupData.orders.map(order => ({
        id: order.id,
        serviceName: order.serviceName,
        description: order.description,
        requirements: order.requirements,
        totalCost: order.totalCost,
        vatAmount: order.vatAmount,
        discountAmount: order.discountAmount,
        finalAmount: order.finalAmount,
        status: order.status,
        estimatedDays: order.estimatedDays,
        deadline: order.deadline,
        completedAt: order.completedAt,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        leadId: order.leadId,
        discountCodeId: order.discountCodeId,
      }))
      await prisma.order.createMany({ data: cleanOrders })
      console.log(`   ✓ Orders: ${cleanOrders.length}`)
    }

    if (backupData.orderPayments?.length > 0) {
      await prisma.orderPayment.createMany({ data: backupData.orderPayments })
      console.log(`   ✓ Order Payments: ${backupData.orderPayments.length}`)
    }

    if (backupData.clients?.length > 0) {
      await prisma.client.createMany({ data: backupData.clients })
      console.log(`   ✓ Clients: ${backupData.clients.length}`)
    }

    if (backupData.staff?.length > 0) {
      await prisma.staff.createMany({ data: backupData.staff })
      console.log(`   ✓ Staff: ${backupData.staff.length}`)
    }

    if (backupData.equipment?.length > 0) {
      await prisma.equipment.createMany({ data: backupData.equipment })
      console.log(`   ✓ Equipment: ${backupData.equipment.length}`)
    }

    if (backupData.caseStudies?.length > 0) {
      // Case studies нужно восстанавливать отдельно из-за many-to-many связей
      for (const caseStudy of backupData.caseStudies) {
        const { staff, equipment, client, caseContent, ...caseStudyData } =
          caseStudy
        await prisma.caseStudy.create({
          data: {
            id: caseStudyData.id,
            clientId: caseStudyData.clientId,
            title: caseStudyData.title,
            tagline: caseStudyData.tagline,
            mainText: caseStudyData.mainText,
            isActive: caseStudyData.isActive,
            imageUrls: caseStudyData.imageUrls || [],
            staff: staff
              ? { connect: staff.map(s => ({ id: s.id })) }
              : undefined,
            equipment: equipment
              ? { connect: equipment.map(e => ({ id: e.id })) }
              : undefined,
          },
        })
      }
      console.log(`   ✓ Case Studies: ${backupData.caseStudies.length}`)
    }

    if (backupData.caseStudyContent?.length > 0) {
      await prisma.caseStudyContent.createMany({
        data: backupData.caseStudyContent,
      })
      console.log(
        `   ✓ Case Study Content: ${backupData.caseStudyContent.length}`
      )
    }

    if (backupData.samples?.length > 0) {
      await prisma.sample.createMany({ data: backupData.samples })
      console.log(`   ✓ Samples: ${backupData.samples.length}`)
    }

    if (backupData.blogRecords?.length > 0) {
      await prisma.blogRecord.createMany({ data: backupData.blogRecords })
      console.log(`   ✓ Blog Records: ${backupData.blogRecords.length}`)
    }

    console.log('\n✅ Восстановление завершено успешно!')
  } catch (error) {
    console.error('\n❌ Ошибка при восстановлении:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Получение пути к файлу из аргументов командной строки
const backupFilePath = process.argv[2]

if (!backupFilePath) {
  console.error('❌ Необходимо указать путь к файлу бэкапа')
  console.log('Использование: npm run db:restore <путь-к-файлу>')
  console.log(
    'Пример: npm run db:restore backups/backup-2024-01-15T10-30-00-000Z.json'
  )
  process.exit(1)
}

// Запуск восстановления
restoreDatabase(backupFilePath)
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
