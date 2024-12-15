-- Niches table
CREATE TABLE niches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    pillars JSONB NOT NULL DEFAULT '[]',
    progress INTEGER DEFAULT 0,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'in_progress')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Pillars table
CREATE TABLE pillars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    niche_id UUID REFERENCES niches(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'in_progress')),
    created_by_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_niches_user_id ON niches(user_id);
CREATE INDEX idx_pillars_niche_id ON pillars(niche_id);

-- Triggers
CREATE TRIGGER update_niches_updated_at
    BEFORE UPDATE ON niches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pillars_updated_at
    BEFORE UPDATE ON pillars
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
