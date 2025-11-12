-- Add approval_status to projects to track admin review state
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS approval_status text;