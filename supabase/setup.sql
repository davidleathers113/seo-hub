-- Drop existing tables if they exist
DROP TABLE IF EXISTS articles;
DROP TABLE IF EXISTS pillars;
DROP TABLE IF EXISTS niches;
DROP TABLE IF EXISTS users;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table first
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  last_login_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Create niches table
CREATE TABLE niches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active'
);

-- Create pillars table
CREATE TABLE pillars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  niche_id UUID NOT NULL REFERENCES niches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  content TEXT,
  description TEXT
);

-- Create articles table
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  pillar_id UUID NOT NULL REFERENCES pillars(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  description TEXT,
  keywords TEXT[] DEFAULT '{}'::TEXT[]
);

-- Create indexes
CREATE INDEX idx_niches_user_id ON niches(user_id);
CREATE INDEX idx_pillars_niche_id ON pillars(niche_id);
CREATE INDEX idx_pillars_user_id ON pillars(user_id);
CREATE INDEX idx_articles_pillar_id ON articles(pillar_id);
CREATE INDEX idx_articles_user_id ON articles(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_niches_updated_at
  BEFORE UPDATE ON niches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pillars_updated_at
  BEFORE UPDATE ON pillars
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE niches ENABLE ROW LEVEL SECURITY;
ALTER TABLE pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own niches" ON niches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own niches" ON niches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own niches" ON niches
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own niches" ON niches
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own pillars" ON pillars
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pillars" ON pillars
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pillars" ON pillars
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pillars" ON pillars
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own articles" ON articles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own articles" ON articles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own articles" ON articles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own articles" ON articles
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to get RLS policies
CREATE OR REPLACE FUNCTION get_policies()
RETURNS TABLE (
  table_name text,
  command text,
  policy_name text,
  definition text,
  permissive text,
  roles text[]
) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pc.relname::text as table_name,
    pg_policy.cmd::text as command,
    pg_policy.polname::text as policy_name,
    pg_policy.polqual::text as definition,
    pg_policy.polpermissive::text as permissive,
    ARRAY_AGG(pg_roles.rolname)::text[] as roles
  FROM pg_policy
  JOIN pg_class pc ON pc.oid = pg_policy.polrelid
  JOIN pg_roles ON pg_roles.oid = ANY(pg_policy.polroles)
  GROUP BY 1, 2, 3, 4, 5;
END;
$$ LANGUAGE plpgsql;

-- Create auth settings table
CREATE TABLE IF NOT EXISTS auth_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_confirmation_required boolean DEFAULT true,
  enable_signup boolean DEFAULT true,
  min_password_length integer DEFAULT 8,
  jwt_expiry_seconds integer DEFAULT 3600,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default auth settings
INSERT INTO auth_settings (
  email_confirmation_required,
  enable_signup,
  min_password_length,
  jwt_expiry_seconds
) VALUES (
  true,  -- Require email confirmation
  true,  -- Enable signups
  8,     -- Minimum password length
  3600   -- JWT expiry in seconds (1 hour)
) ON CONFLICT DO NOTHING;

-- Enable RLS on auth_settings
ALTER TABLE auth_settings ENABLE ROW LEVEL SECURITY;

-- Only allow service role to access auth settings
CREATE POLICY "Service role can manage auth settings"
ON auth_settings
USING (auth.jwt()->>'role' = 'service_role');

-- Storage bucket policies
-- Article images policies
CREATE POLICY "Public can view article images"
ON storage.objects FOR SELECT
USING (bucket_id = 'public_article_images');

CREATE POLICY "Authenticated users can upload article images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'public_article_images'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own article images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'public_article_images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own article images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'public_article_images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- User avatars policies
CREATE POLICY "Public can view user avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'public_user_avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'public_user_avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'public_user_avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'public_user_avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Private documents policies
CREATE POLICY "Users can access their own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
