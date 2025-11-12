/*
  # Create submissions table

  Stores user submissions of verification photos and their review lifecycle.

  Columns:
    - id (uuid, pk)
    - user_id (uuid, fk -> users.id)
    - template_id (uuid, fk -> templates.id)
    - project_id (uuid, fk -> projects.id)
    - project_name (text)
    - image_url (text)
    - status (text) default 'pending'
    - submitted_at (timestamptz) default now()
    - reviewed_by (uuid, fk -> users.id)
    - reviewed_at (timestamptz)
    - created_at (timestamptz) default now()
    - updated_at (timestamptz) default now()

  RLS:
    - SELECT: owner or reviewer can view
    - INSERT: owner can create
    - UPDATE: reviewer can update; special policy to allow setting reviewer initially
*/

CREATE TABLE IF NOT EXISTS public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES public.templates(id),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  project_name text NOT NULL,
  image_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  submitted_at timestamptz DEFAULT now(),
  reviewed_by uuid REFERENCES public.users(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Allow owners to view their own submissions; reviewers can view those they reviewed
CREATE POLICY "Users can view their own and reviewed submissions"
  ON public.submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = reviewed_by);

-- Allow owners to insert submissions they own
CREATE POLICY "Users can create their own submissions"
  ON public.submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow reviewers to update submissions they are assigned to
CREATE POLICY "Reviewers can update assigned submissions"
  ON public.submissions FOR UPDATE
  TO authenticated
  USING (auth.uid() = reviewed_by)
  WITH CHECK (auth.uid() = reviewed_by);

-- Special policy: allow a non-owner to set themselves as the reviewer initially
CREATE POLICY "Reviewers can claim pending submissions"
  ON public.submissions FOR UPDATE
  TO authenticated
  USING (reviewed_by IS NULL AND auth.uid() <> user_id)
  WITH CHECK (reviewed_by = auth.uid());