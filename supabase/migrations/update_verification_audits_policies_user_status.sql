/*
  # Update verification_audits RLS policies to enforce active user status

  Suspended users should not be able to create verification audits.
*/

ALTER TABLE public.verification_audits ENABLE ROW LEVEL SECURITY;

-- Drop and recreate insert policy with status check
DROP POLICY IF EXISTS "Authenticated users can create verification audits" ON public.verification_audits;

CREATE POLICY "Authenticated active users can create verification audits" ON public.verification_audits
  FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = uploaded_by AND u.status = 'active'
    )
  );