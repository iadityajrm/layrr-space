/*
  # Update projects RLS policies to enforce active user status

  This migration drops existing policies and recreates them with an additional
  check that the associated user has status = 'active'.
*/

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if present
DROP POLICY IF EXISTS "Users can view their own projects." ON public.projects;
DROP POLICY IF EXISTS "Users can create their own projects." ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects." ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects." ON public.projects;

-- Helper predicate: ensure project owner is current user AND owner is active
-- Recreate policies with active status enforcement
CREATE POLICY "Users can view their own projects."
  ON public.projects FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = user_id AND u.status = 'active'
    )
  );

CREATE POLICY "Users can create their own projects."
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = user_id AND u.status = 'active'
    )
  );

CREATE POLICY "Users can update their own projects."
  ON public.projects FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = user_id AND u.status = 'active'
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = user_id AND u.status = 'active'
    )
  );

CREATE POLICY "Users can delete their own projects."
  ON public.projects FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = user_id AND u.status = 'active'
    )
  );