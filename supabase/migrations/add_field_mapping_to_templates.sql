-- Add field_mapping column to templates table
ALTER TABLE public.templates
ADD COLUMN field_mapping JSONB;

-- Update RLS policy to allow field_mapping to be publicly readable
DROP POLICY IF EXISTS "Templates are publicly readable." ON public.templates;
CREATE POLICY "Templates are publicly readable."
  ON public.templates FOR SELECT
  USING (true);
