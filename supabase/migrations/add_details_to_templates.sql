/*
  # Add detailed fields to templates

  This migration enhances the `templates` table by adding new columns
  to store more comprehensive information about each template. This
  supports the template detail page feature.

  1. Changes
    - Adds `instructions` (text): Step-by-step guide on how to use the template.
    - Adds `marketing_info` (text): Tips and strategies for marketing the template.
    - Adds `use_cases` (text): Examples of ideal use cases for the template.
*/

-- Add new detailed columns to the templates table
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS instructions text;
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS marketing_info text;
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS use_cases text;
