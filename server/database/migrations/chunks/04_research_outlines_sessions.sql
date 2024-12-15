-- Research table
CREATE TABLE research (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subpillar_id UUID REFERENCES subpillars(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    source TEXT NOT NULL,
    relevance INTEGER,
    notes TEXT,
    created_by_id UUID REFERENCES users(id),
    article_id UUID REFERENCES articles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Outlines table
CREATE TABLE outlines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subpillar_id UUID REFERENCES subpillars(id) ON DELETE CASCADE,
    sections JSONB NOT NULL DEFAULT '[]',
    status TEXT CHECK (status IN ('draft', 'approved', 'in_progress')),
    created_by_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    user_agent TEXT,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_research_subpillar_id ON research(subpillar_id);
CREATE INDEX idx_research_article_id ON research(article_id);
CREATE INDEX idx_outlines_subpillar_id ON outlines(subpillar_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);

-- Triggers
CREATE TRIGGER update_research_updated_at
    BEFORE UPDATE ON research
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outlines_updated_at
    BEFORE UPDATE ON outlines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
