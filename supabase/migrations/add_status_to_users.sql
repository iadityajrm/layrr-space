/*
  # Add status column to users table

  - Adds `status` column with allowed values 'active' and 'suspended'
  - Defaults to 'active'
  - Keeps existing policies; status is used by other table policies
*/

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

-- Optional: add constraint to restrict allowed values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_status_check'
  ) THEN
    ALTER TABLE public.users
    ADD CONSTRAINT users_status_check CHECK (status IN ('active','suspended'));
  END IF;
END $$;