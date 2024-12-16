-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('public_article_images', 'public_article_images', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp']::text[]),
  ('public_user_avatars', 'public_user_avatars', true, 2097152, ARRAY['image/png', 'image/jpeg', 'image/webp']::text[]),
  ('documents', 'documents', false, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']::text[])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Storage policies
-- Article images policies
CREATE POLICY "Public can view article images"
ON storage.objects FOR SELECT
USING (bucket_id = 'public_article_images');

CREATE POLICY "Users can upload article images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'public_article_images'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can manage their article images"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'public_article_images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- User avatars policies
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'public_user_avatars');

CREATE POLICY "Users can manage their avatar"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'public_user_avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Private documents policies
CREATE POLICY "Users can manage their documents"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
