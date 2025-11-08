-- Add standardized columns to projects table
ALTER TABLE public.projects
ADD COLUMN business_name text,
ADD COLUMN logo_url text,
ADD COLUMN theme_color text,
ADD COLUMN redirect_url text,
ADD COLUMN question_title text,
ADD COLUMN internal_feedback_endpoint text,
ADD COLUMN qr_code_url text,
ADD COLUMN data1 text,
ADD COLUMN data2 text,
ADD COLUMN data3 text,
ADD COLUMN data4 text,
ADD COLUMN data5 text,
ADD COLUMN data6 text,
ADD COLUMN data7 text,
ADD COLUMN data8 text;

-- Add unique index for slug in projects table
CREATE UNIQUE INDEX projects_slug_idx ON public.projects (slug);

-- Create a function to generate a unique slug
CREATE OR REPLACE FUNCTION public.generate_unique_slug(base_text text, table_name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    new_slug text;
    counter int := 0;
    temp_slug text;
BEGIN
    -- Normalize the base text to create a slug
    temp_slug := lower(regexp_replace(base_text, '[^a-zA-Z0-9]+', '-', 'g'));
    temp_slug := trim(BOTH '-' FROM temp_slug);

    -- Check for uniqueness and append counter if necessary
    LOOP
        IF counter = 0 THEN
            new_slug := temp_slug;
        ELSE
            new_slug := temp_slug || '-' || counter;
        END IF;

        -- Check if the slug already exists in the specified table
        IF NOT EXISTS (SELECT 1 FROM public.projects WHERE slug = new_slug) THEN
            RETURN new_slug;
        END IF;

        counter := counter + 1;
    END LOOP;
END;
$$;

-- Create a trigger function to automatically generate slug on project insert
CREATE OR REPLACE FUNCTION public.set_project_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := public.generate_unique_slug(NEW.project_name, 'projects');
    END IF;
    RETURN NEW;
END;
$$;

-- Attach the trigger to the projects table
CREATE TRIGGER set_project_slug_trigger
BEFORE INSERT ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.set_project_slug();

-- Update RLS policies for projects table to include new columns
DROP POLICY IF EXISTS "Users can view their own projects." ON public.projects;
CREATE POLICY "Users can view their own projects."
  ON public.projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own projects." ON public.projects;
CREATE POLICY "Users can create their own projects."
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own projects." ON public.projects;
CREATE POLICY "Users can update their own projects."
  ON public.projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own projects." ON public.projects;
CREATE POLICY "Users can delete their own projects."
  ON public.projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
