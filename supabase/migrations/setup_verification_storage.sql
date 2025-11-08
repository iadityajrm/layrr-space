-- Create storage bucket for project verification images
-- Note: This needs to be executed in the Supabase dashboard or via SQL editor
-- as storage bucket creation requires special permissions

-- The following SQL should be run in Supabase SQL editor:

-- 1. Create storage bucket
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES ('project-verification', 'project-verification', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png']);

-- 2. Create storage policies for the bucket
-- CREATE POLICY "Public can read verification images" ON storage.objects
-- FOR SELECT USING (bucket_id = 'project-verification');

-- CREATE POLICY "Authenticated users can upload verification images" ON storage.objects
-- FOR INSERT WITH CHECK (
--     bucket_id = 'project-verification' AND
--     auth.role() = 'authenticated'
-- );

-- CREATE POLICY "Users can update their own verification images" ON storage.objects
-- FOR UPDATE USING (
--     bucket_id = 'project-verification' AND
--     auth.uid() = (storage.foldername(name))[1]::uuid
-- );

-- CREATE POLICY "Users can delete their own verification images" ON storage.objects
-- FOR DELETE USING (
--     bucket_id = 'project-verification' AND
--     auth.uid() = (storage.foldername(name))[1]::uuid
-- );

-- Note: The above policies assume the file naming convention: {project_id}-{timestamp}.{ext}
-- This allows us to extract the project_id from the filename for access control