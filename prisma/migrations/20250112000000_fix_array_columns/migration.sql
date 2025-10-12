-- Fix array columns that are stored as text
-- Convert text columns to proper PostgreSQL arrays

-- Fix services.includes
ALTER TABLE services 
ALTER COLUMN includes TYPE text[] 
USING CASE 
  WHEN includes IS NULL OR includes = '' THEN '{}'::text[]
  WHEN includes::text LIKE '{%}' THEN includes::text[]
  ELSE ARRAY[includes]::text[]
END;

-- Verify other array columns are correct
-- These should already be arrays, but let's ensure they are

-- Fix studios.gallery if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'studios' 
      AND column_name = 'gallery' 
      AND data_type != 'ARRAY'
  ) THEN
    ALTER TABLE studios 
    ALTER COLUMN gallery TYPE text[] 
    USING CASE 
      WHEN gallery IS NULL OR gallery = '' THEN '{}'::text[]
      WHEN gallery::text LIKE '{%}' THEN gallery::text[]
      ELSE ARRAY[gallery]::text[]
    END;
  END IF;
END $$;

-- Fix discount_codes.applicableContentTypes if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'discount_codes' 
      AND column_name = 'applicableContentTypes' 
      AND data_type != 'ARRAY'
  ) THEN
    ALTER TABLE discount_codes 
    ALTER COLUMN "applicableContentTypes" TYPE text[] 
    USING CASE 
      WHEN "applicableContentTypes" IS NULL OR "applicableContentTypes" = '' THEN '{}'::text[]
      WHEN "applicableContentTypes"::text LIKE '{%}' THEN "applicableContentTypes"::text[]
      ELSE ARRAY["applicableContentTypes"]::text[]
    END;
  END IF;
END $$;

-- Fix additional_services.imageUrls if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'additional_services' 
      AND column_name = 'imageUrls' 
      AND data_type != 'ARRAY'
  ) THEN
    ALTER TABLE additional_services 
    ALTER COLUMN "imageUrls" TYPE text[] 
    USING CASE 
      WHEN "imageUrls" IS NULL OR "imageUrls" = '' THEN '{}'::text[]
      WHEN "imageUrls"::text LIKE '{%}' THEN "imageUrls"::text[]
      ELSE ARRAY["imageUrls"]::text[]
    END;
  END IF;
END $$;

-- Fix case_studies.imageUrls if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'case_studies' 
      AND column_name = 'imageUrls' 
      AND data_type != 'ARRAY'
  ) THEN
    ALTER TABLE case_studies 
    ALTER COLUMN "imageUrls" TYPE text[] 
    USING CASE 
      WHEN "imageUrls" IS NULL OR "imageUrls" = '' THEN '{}'::text[]
      WHEN "imageUrls"::text LIKE '{%}' THEN "imageUrls"::text[]
      ELSE ARRAY["imageUrls"]::text[]
    END;
  END IF;
END $$;

-- Fix case_study_content.text if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'case_study_content' 
      AND column_name = 'text' 
      AND data_type != 'ARRAY'
  ) THEN
    ALTER TABLE case_study_content 
    ALTER COLUMN text TYPE text[] 
    USING CASE 
      WHEN text IS NULL OR text = '' THEN '{}'::text[]
      WHEN text::text LIKE '{%}' THEN text::text[]
      ELSE ARRAY[text]::text[]
    END;
  END IF;
END $$;

-- Fix case_study_content.list if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'case_study_content' 
      AND column_name = 'list' 
      AND data_type != 'ARRAY'
  ) THEN
    ALTER TABLE case_study_content 
    ALTER COLUMN list TYPE text[] 
    USING CASE 
      WHEN list IS NULL OR list = '' THEN '{}'::text[]
      WHEN list::text LIKE '{%}' THEN list::text[]
      ELSE ARRAY[list]::text[]
    END;
  END IF;
END $$;

