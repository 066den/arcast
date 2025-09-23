/*
  Warnings:

  - The values [STANDARD_EDIT_SHORT_FORM] on the enum `AdditionalServiceType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `contentTypeId` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `packageId` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the `_ContentPackageToStudio` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_StudioToStudioPackage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `content_package_perks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `content_packages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `content_types` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `package_perks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `studio_packages` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."AdditionalServiceType_new" AS ENUM ('STANDARD', 'BY_THREE');
ALTER TABLE "public"."additional_services" ALTER COLUMN "type" TYPE "public"."AdditionalServiceType_new" USING ("type"::text::"public"."AdditionalServiceType_new");
ALTER TYPE "public"."AdditionalServiceType" RENAME TO "AdditionalServiceType_old";
ALTER TYPE "public"."AdditionalServiceType_new" RENAME TO "AdditionalServiceType";
DROP TYPE "public"."AdditionalServiceType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."_ContentPackageToStudio" DROP CONSTRAINT "_ContentPackageToStudio_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ContentPackageToStudio" DROP CONSTRAINT "_ContentPackageToStudio_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_StudioToStudioPackage" DROP CONSTRAINT "_StudioToStudioPackage_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_StudioToStudioPackage" DROP CONSTRAINT "_StudioToStudioPackage_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."bookings" DROP CONSTRAINT "bookings_contentPackageId_fkey";

-- DropForeignKey
ALTER TABLE "public"."bookings" DROP CONSTRAINT "bookings_contentTypeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."bookings" DROP CONSTRAINT "bookings_packageId_fkey";

-- DropForeignKey
ALTER TABLE "public"."content_package_perks" DROP CONSTRAINT "content_package_perks_contentPackageId_fkey";

-- DropForeignKey
ALTER TABLE "public"."content_packages" DROP CONSTRAINT "content_packages_contentTypeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."package_perks" DROP CONSTRAINT "package_perks_packageId_fkey";

-- AlterTable
ALTER TABLE "public"."additional_services" ALTER COLUMN "type" SET DEFAULT 'STANDARD';

-- AlterTable
ALTER TABLE "public"."booking_additional_services" ADD COLUMN     "createdAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."bookings" DROP COLUMN "contentTypeId",
DROP COLUMN "packageId",
ADD COLUMN     "serviceId" TEXT;

-- AlterTable
ALTER TABLE "public"."studios" ALTER COLUMN "location" SET DEFAULT 'Dubai';

-- DropTable
DROP TABLE "public"."_ContentPackageToStudio";

-- DropTable
DROP TABLE "public"."_StudioToStudioPackage";

-- DropTable
DROP TABLE "public"."content_package_perks";

-- DropTable
DROP TABLE "public"."content_packages";

-- DropTable
DROP TABLE "public"."content_types";

-- DropTable
DROP TABLE "public"."package_perks";

-- DropTable
DROP TABLE "public"."studio_packages";

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
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_contentPackageId_fkey" FOREIGN KEY ("contentPackageId") REFERENCES "public"."packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
