-- DropForeignKey
ALTER TABLE "public"."_ContentPackageToStudio" DROP CONSTRAINT "_ContentPackageToStudio_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ContentPackageToStudio" DROP CONSTRAINT "_ContentPackageToStudio_B_fkey";

-- AddForeignKey
ALTER TABLE "public"."_ContentPackageToStudio" ADD CONSTRAINT "_ContentPackageToStudio_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."studios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ContentPackageToStudio" ADD CONSTRAINT "_ContentPackageToStudio_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."content_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
