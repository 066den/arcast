-- Add slug column to service_types table
-- First add it as nullable
ALTER TABLE "service_types" ADD COLUMN "slug" TEXT;

-- Fill existing rows with slug values based on name
-- Convert name to lowercase and replace spaces with hyphens
UPDATE "service_types" 
SET "slug" = lower(regexp_replace("name", '\s+', '-', 'g'))
WHERE "slug" IS NULL;

-- Make the column required and add unique constraint
ALTER TABLE "service_types" 
ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "service_types_slug_key" ON "service_types"("slug");

