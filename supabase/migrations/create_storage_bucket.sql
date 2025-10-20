/*
  # Create storage bucket for proof uploads

  This migration creates a new storage bucket named `proof_uploads`
  and sets up security policies for it.

  1. New Storage Bucket
    - `proof_uploads`: A public bucket to store proof of sale images.

  2. Security Policies
    - "Authenticated users can upload proofs": Allows logged-in users to upload files.
    - "Anyone can view proofs": Makes the images publicly accessible for viewing.
*/

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('proof_uploads', 'proof_uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for storage bucket
CREATE POLICY "Authenticated users can upload proofs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'proof_uploads');

CREATE POLICY "Anyone can view proofs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'proof_uploads');
