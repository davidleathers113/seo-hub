-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    token VARCHAR(255),
    last_login_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Niches table
CREATE TABLE IF NOT EXISTS niches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pillars table
CREATE TABLE IF NOT EXISTS pillars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    niche_id UUID REFERENCES niches(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    created_by_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subpillars table
CREATE TABLE IF NOT EXISTS subpillars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    pillar_id UUID REFERENCES pillars(id) ON DELETE CASCADE,
    created_by_id UUID REFERENCES users(id),
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    subpillar_id UUID REFERENCES subpillars(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id),
    status VARCHAR(50) NOT NULL,
    seo_score INTEGER,
    keywords TEXT[],
    meta_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Research table
CREATE TABLE IF NOT EXISTS research (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subpillar_id UUID REFERENCES subpillars(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    source VARCHAR(255) NOT NULL,
    relevance INTEGER NOT NULL,
    notes TEXT,
    created_by_id UUID REFERENCES users(id),
    article_id UUID REFERENCES articles(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Outlines table
CREATE TABLE IF NOT EXISTS outlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subpillar_id UUID REFERENCES subpillars(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    created_by_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Outline sections table
CREATE TABLE IF NOT EXISTS outline_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outline_id UUID REFERENCES outlines(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content_points JSONB NOT NULL,
    order_index INTEGER NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    last_activity_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    user_agent TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_token ON users(token);
CREATE INDEX IF NOT EXISTS idx_niches_user_id ON niches(user_id);
CREATE INDEX IF NOT EXISTS idx_pillars_niche_id ON pillars(niche_id);
CREATE INDEX IF NOT EXISTS idx_subpillars_pillar_id ON subpillars(pillar_id);
CREATE INDEX IF NOT EXISTS idx_articles_subpillar_id ON articles(subpillar_id);
CREATE INDEX IF NOT EXISTS idx_research_subpillar_id ON research(subpillar_id);
CREATE INDEX IF NOT EXISTS idx_outlines_subpillar_id ON outlines(subpillar_id);
CREATE INDEX IF NOT EXISTS idx_outline_sections_outline_id ON outline_sections(outline_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);

-- Add triggers to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

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

CREATE TRIGGER update_subpillars_updated_at
    BEFORE UPDATE ON subpillars
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_research_updated_at
    BEFORE UPDATE ON research
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outlines_updated_at
    BEFORE UPDATE ON outlines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outline_sections_updated_at
    BEFORE UPDATE ON outline_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
