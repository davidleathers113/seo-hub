-- Subpillars table
CREATE TABLE subpillars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    pillar_id UUID REFERENCES pillars(id) ON DELETE CASCADE,
    created_by_id UUID REFERENCES users(id),
    status TEXT CHECK (status IN ('draft', 'active', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Articles table
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    subpillar_id UUID REFERENCES subpillars(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id),
    status TEXT CHECK (status IN ('draft', 'review', 'published')),
    seo_score INTEGER,
    readability_score INTEGER,
    plagiarism_score INTEGER,
    keyword_density FLOAT,
    keywords TEXT[],
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_subpillars_pillar_id ON subpillars(pillar_id);
CREATE INDEX idx_articles_subpillar_id ON articles(subpillar_id);
CREATE INDEX idx_articles_author_id ON articles(author_id);

-- Triggers
CREATE TRIGGER update_subpillars_updated_at
    BEFORE UPDATE ON subpillars
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
