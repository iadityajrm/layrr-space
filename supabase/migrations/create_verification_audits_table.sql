-- Create verification_audits table
CREATE TABLE IF NOT EXISTS public.verification_audits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    location_metadata JSONB,
    uploaded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.verification_audits ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_verification_audits_project_id ON public.verification_audits(project_id);
CREATE INDEX idx_verification_audits_uploaded_by ON public.verification_audits(uploaded_by);
CREATE INDEX idx_verification_audits_created_at ON public.verification_audits(created_at);

-- Create policies
-- Allow project owners to view verification audits for their projects
CREATE POLICY "Project owners can view verification audits" ON public.verification_audits
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = verification_audits.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- Allow authenticated users to create verification audits
CREATE POLICY "Authenticated users can create verification audits" ON public.verification_audits
    FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated' AND
        uploaded_by = auth.uid()
    );

-- Create updated_at trigger
CREATE TRIGGER update_verification_audits_updated_at
    BEFORE UPDATE ON public.verification_audits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();