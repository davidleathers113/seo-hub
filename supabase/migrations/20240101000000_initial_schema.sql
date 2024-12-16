-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    password TEXT NOT NULL,
    token TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    last_login_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create niches table
CREATE TABLE IF NOT EXISTS niches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in_progress')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create pillars table
CREATE TABLE IF NOT EXISTS pillars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    niche_id UUID REFERENCES niches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    pillar_id UUID REFERENCES pillars(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published')),
    keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
    meta_description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_niches_user_id ON niches(user_id);
CREATE INDEX IF NOT EXISTS idx_pillars_niche_id ON pillars(niche_id);
CREATE INDEX IF NOT EXISTS idx_pillars_user_id ON pillars(user_id);
CREATE INDEX IF NOT EXISTS idx_articles_pillar_id ON articles(pillar_id);
CREATE INDEX IF NOT EXISTS idx_articles_user_id ON articles(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS users_update_trigger ON users;
CREATE TRIGGER users_update_trigger
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS niches_update_trigger ON niches;
CREATE TRIGGER niches_update_trigger
    BEFORE UPDATE ON niches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS pillars_update_trigger ON pillars;
CREATE TRIGGER pillars_update_trigger
    BEFORE UPDATE ON pillars
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS articles_update_trigger ON articles;
CREATE TRIGGER articles_update_trigger
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE niches ENABLE ROW LEVEL SECURITY;
ALTER TABLE pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users
CREATE POLICY "select_users_policy" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "update_users_policy" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for niches
CREATE POLICY "select_niches_policy" ON niches
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_niches_policy" ON niches
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_niches_policy" ON niches
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "delete_niches_policy" ON niches
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for pillars
CREATE POLICY "select_pillars_policy" ON pillars
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_pillars_policy" ON pillars
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_pillars_policy" ON pillars
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "delete_pillars_policy" ON pillars
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for articles
CREATE POLICY "select_articles_policy" ON articles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_articles_policy" ON articles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_articles_policy" ON articles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "delete_articles_policy" ON articles
    FOR DELETE USING (auth.uid() = user_id);
