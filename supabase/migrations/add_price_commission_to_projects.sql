-- Add price and commission_rate to projects
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS price numeric,
  ADD COLUMN IF NOT EXISTS commission_rate numeric;