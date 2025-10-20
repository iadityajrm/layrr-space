/*
  # Create templates table

  This migration creates the `templates` table to store all available
  website templates that users can sell.

  1. New Tables
    - `templates`
      - `id` (uuid, primary key): Unique identifier for the template.
      - `template_name` (text): The display name of the template.
      - `slug` (text, unique): URL-friendly slug for the template.
      - `preview_image_url` (text): URL for the template's preview image.
      - `price` (numeric): The price of the template.
      - `commission_rate` (numeric): The commission rate for selling the template.
      - `category` (text): Category of the template (e.g., 'Food &amp; Beverage').
      - `description` (text): A short description of the template.
      - `template_url` (text): The URL to the live template.
      - `created_at` (timestamptz): Timestamp of creation.

  2. Security
    - Enable RLS on `templates` table.
    - Add policy "Templates are publicly readable.": Allows anyone to view the templates.
*/

-- Create the templates table
CREATE TABLE IF NOT EXISTS public.templates (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name text NOT NULL,
  slug text NOT NULL UNIQUE,
  preview_image_url text,
  price numeric NOT NULL,
  commission_rate numeric NOT NULL DEFAULT 0.25,
  category text,
  description text,
  template_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Policies for templates table
CREATE POLICY "Templates are publicly readable."
  ON public.templates FOR SELECT
  USING (true);
