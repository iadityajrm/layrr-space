/*
  # Rename template columns for consistency

  This migration renames columns in the `templates` table to align with the frontend codebase.

  1. Changes
    - Renames `template_name` column to `title`.
    - Renames `preview_image_url` column to `preview_url`.
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'templates' AND column_name = 'template_name'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'templates' AND column_name = 'title'
  ) THEN
    ALTER TABLE public.templates RENAME COLUMN template_name TO title;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'templates' AND column_name = 'preview_image_url'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'templates' AND column_name = 'preview_url'
  ) THEN
    ALTER TABLE public.templates RENAME COLUMN preview_image_url TO preview_url;
  END IF;
END $$;
