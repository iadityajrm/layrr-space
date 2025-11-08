/*
  # Fix feedbacks table schema

  This migration updates the feedbacks table to:
  1. Add missing project_id column with foreign key constraint
  2. Fix column naming inconsistencies
  3. Add proper indexes and constraints
  4. Enable RLS with appropriate policies
*/

-- Add project_id column to feedbacks table
ALTER TABLE public.feedbacks 
ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE;

-- Rename 'Stars' column to 'stars' for consistency
ALTER TABLE public.feedbacks 
RENAME COLUMN "Stars" TO "stars";

-- Add proper indexes
CREATE INDEX IF NOT EXISTS idx_feedbacks_project_id ON public.feedbacks(project_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON public.feedbacks(created_at);

-- Enable Row Level Security
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view feedback for public projects" ON public.feedbacks;
DROP POLICY IF EXISTS "Users can create feedback for public projects" ON public.feedbacks;

-- Create new policies
CREATE POLICY "Users can view feedback for public projects"
  ON public.feedbacks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = feedbacks.project_id 
      AND projects.status IN ('published', 'approved')
    )
  );

CREATE POLICY "Users can create feedback for public projects"
  ON public.feedbacks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = feedbacks.project_id 
      AND projects.status IN ('published', 'approved')
    )
  );

-- Update existing feedback records to have proper column names
-- This is a data migration that should be run carefully in production
UPDATE public.feedbacks 
SET stars = "Stars" 
WHERE stars IS NULL AND "Stars" IS NOT NULL;