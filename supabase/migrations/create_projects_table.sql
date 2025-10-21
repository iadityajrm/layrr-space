/*
      # Create projects table

      This migration sets up the `projects` table, which links users to the
      templates they have sold. It stores details about each project.

      1. New Tables
        - `projects`
          - `id` (uuid, primary key): Unique identifier for the project.
          - `user_id` (uuid, foreign key): References `users.id`.
          - `template_id` (uuid, foreign key): References `templates.id`.
          - `project_name` (text): Custom name for the project.
          - `slug` (text): URL-friendly slug for the project instance.
          - `status` (text): Current status (e.g., 'active', 'completed').
          - `proof_photo_url` (text): URL of the uploaded proof of sale.
          - `created_at` (timestamptz): Timestamp of creation.
          - `updated_at` (timestamptz): Timestamp of last update.

      2. Relationships
        - `projects.user_id` references `public.users.id`.
        - `projects.template_id` references `public.templates.id`.
        - `ON DELETE CASCADE` is set for `user_id` so that if a user is deleted, their projects are also deleted.

      3. Security
        - Enable RLS on `projects` table.
        - Add policies for SELECT, INSERT, UPDATE, and DELETE to ensure users can only manage their own projects.
    */

    -- Create the projects table
    CREATE TABLE IF NOT EXISTS public.projects (
      id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      template_id uuid NOT NULL REFERENCES public.templates(id),
      project_name text NOT NULL,
      slug text NOT NULL,
      status text NOT NULL DEFAULT 'pending_verification',
      proof_photo_url text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    -- Enable Row Level Security
    ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

    -- Policies for projects table
    CREATE POLICY "Users can view their own projects."
      ON public.projects FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can create their own projects."
      ON public.projects FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own projects."
      ON public.projects FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own projects."
      ON public.projects FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
