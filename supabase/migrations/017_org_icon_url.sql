-- Add icon_url column to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS icon_url text;

-- Create org-icons storage bucket (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('org-icons', 'org-icons', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their own org folder
CREATE POLICY "Org admins can upload icons"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'org-icons'
    AND (storage.foldername(name))[1] IN (
      SELECT m.org_id::text FROM memberships m
      WHERE m.user_id = auth.uid() AND m.role = 'admin' AND m.is_active = true
    )
  );

-- Anyone can read org icons (public bucket)
CREATE POLICY "Public read org icons"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'org-icons');

-- Org admins can delete old icons
CREATE POLICY "Org admins can delete icons"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'org-icons'
    AND (storage.foldername(name))[1] IN (
      SELECT m.org_id::text FROM memberships m
      WHERE m.user_id = auth.uid() AND m.role = 'admin' AND m.is_active = true
    )
  );
