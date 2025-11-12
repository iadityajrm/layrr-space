-- Add price and commission_rate to submissions
ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS price numeric,
  ADD COLUMN IF NOT EXISTS commission_rate numeric;