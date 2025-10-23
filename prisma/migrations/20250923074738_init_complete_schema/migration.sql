-- CreateEnum
CREATE TYPE "public"."DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- CreateEnum
CREATE TYPE "public"."BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."AdditionalServiceType" AS ENUM ('STANDARD', 'BY_THREE');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "public"."studios" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL DEFAULT 'Dubai',
    "imageUrl" TEXT,
    "totalSeats" INTEGER NOT NULL,
    "openingTime" TEXT NOT NULL,
    "closingTime" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "studios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."service_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "includes" TEXT,
    "imageUrl" TEXT,
    "serviceTypeId" TEXT NOT NULL,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."service_packages_records" (
    "id" TEXT NOT NULL,
    "parentContentPackageId" TEXT NOT NULL,
    "includedServiceId" TEXT NOT NULL,
    "serviceQuantity" INTEGER NOT NULL,

    CONSTRAINT "service_packages_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."add_service_packages_records" (
    "id" TEXT NOT NULL,
    "parentContentPackageId" TEXT NOT NULL,
    "includedServiceId" TEXT NOT NULL,
    "serviceQuantity" INTEGER NOT NULL,

    CONSTRAINT "add_service_packages_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."packages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."discount_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "public"."DiscountType" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "usageLimit" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "firstTimeOnly" BOOLEAN NOT NULL DEFAULT false,
    "minOrderAmount" DECIMAL(10,2),
    "applicableContentTypes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discount_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bookings" (
    "id" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "numberOfSeats" INTEGER NOT NULL,
    "totalCost" DECIMAL(10,2) NOT NULL,
    "vatAmount" DECIMAL(10,2),
    "discountAmount" DECIMAL(10,2),
    "finalAmount" DECIMAL(10,2),
    "status" "public"."BookingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "studioId" TEXT,
    "contentPackageId" TEXT,
    "serviceId" TEXT,
    "leadId" TEXT NOT NULL,
    "discountCodeId" TEXT,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."leads" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phoneNumber" TEXT,
    "whatsappNumber" TEXT,
    "recordingLocation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."additional_services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."AdditionalServiceType" NOT NULL DEFAULT 'STANDARD',
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "count" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT,
    "imageUrls" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "additional_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."booking_additional_services" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "booking_additional_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payments" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT NOT NULL DEFAULT 'MAMO_PAY',
    "externalId" TEXT,
    "paymentLinkId" TEXT,
    "metadata" JSONB,
    "completedAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."case_studies" (
    "id" TEXT NOT NULL,
    "clientId" TEXT,
    "title" TEXT,
    "tagline" TEXT,
    "mainText" TEXT,
    "content" JSONB,
    "featured" BOOLEAN NOT NULL DEFAULT true,
    "imageUrls" TEXT[],

    CONSTRAINT "case_studies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."equipment" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."staff" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT,
    "imageUrl" TEXT,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."clients" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "showTitle" TEXT,
    "jobTitle" TEXT,
    "testimonial" TEXT,
    "imageUrl" TEXT,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."case_staff" (
    "id" TEXT NOT NULL,
    "caseStudyId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,

    CONSTRAINT "case_staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."case_equipment" (
    "id" TEXT NOT NULL,
    "caseStudyId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,

    CONSTRAINT "case_equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."samples" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "thumbUrl" TEXT,
    "videoUrl" TEXT,

    CONSTRAINT "samples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."blog_records" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "tagline" TEXT,
    "mainText" TEXT,
    "imageUrls" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_types_name_key" ON "public"."service_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "services_name_key" ON "public"."services"("name");

-- CreateIndex
CREATE UNIQUE INDEX "discount_codes_code_key" ON "public"."discount_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "booking_additional_services_bookingId_serviceId_key" ON "public"."booking_additional_services"("bookingId", "serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_bookingId_key" ON "public"."payments"("bookingId");

-- AddForeignKey
ALTER TABLE "public"."services" ADD CONSTRAINT "services_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "public"."service_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."service_packages_records" ADD CONSTRAINT "service_packages_records_parentContentPackageId_fkey" FOREIGN KEY ("parentContentPackageId") REFERENCES "public"."packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."service_packages_records" ADD CONSTRAINT "service_packages_records_includedServiceId_fkey" FOREIGN KEY ("includedServiceId") REFERENCES "public"."services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."add_service_packages_records" ADD CONSTRAINT "add_service_packages_records_parentContentPackageId_fkey" FOREIGN KEY ("parentContentPackageId") REFERENCES "public"."packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."add_service_packages_records" ADD CONSTRAINT "add_service_packages_records_includedServiceId_fkey" FOREIGN KEY ("includedServiceId") REFERENCES "public"."additional_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "public"."studios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_contentPackageId_fkey" FOREIGN KEY ("contentPackageId") REFERENCES "public"."packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_discountCodeId_fkey" FOREIGN KEY ("discountCodeId") REFERENCES "public"."discount_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."booking_additional_services" ADD CONSTRAINT "booking_additional_services_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."booking_additional_services" ADD CONSTRAINT "booking_additional_services_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."additional_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."case_studies" ADD CONSTRAINT "case_studies_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."case_staff" ADD CONSTRAINT "case_staff_caseStudyId_fkey" FOREIGN KEY ("caseStudyId") REFERENCES "public"."case_studies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."case_staff" ADD CONSTRAINT "case_staff_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."case_equipment" ADD CONSTRAINT "case_equipment_caseStudyId_fkey" FOREIGN KEY ("caseStudyId") REFERENCES "public"."case_studies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."case_equipment" ADD CONSTRAINT "case_equipment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "public"."equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
