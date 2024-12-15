-- Create content_generations table for tracking AI-generated content
CREATE TABLE IF NOT EXISTS content_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    llm_id INTEGER REFERENCES llms(id),
    prompt TEXT NOT NULL,
    temperature DECIMAL(3,2) NOT NULL,
    max_tokens INTEGER NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    error TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by_id UUID REFERENCES users(id),
    CONSTRAINT valid_content_type CHECK (content_type IN ('pillar', 'subpillar', 'outline', 'article')),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'failed')),
    CONSTRAINT valid_temperature CHECK (temperature >= 0 AND temperature <= 1)
);

-- Create indexes for efficient querying
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_content_generations_content') THEN
        CREATE INDEX idx_content_generations_content ON content_generations(content_id, content_type);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_content_generations_llm') THEN
        CREATE INDEX idx_content_generations_llm ON content_generations(llm_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_content_generations_status') THEN
        CREATE INDEX idx_content_generations_status ON content_generations(status);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_content_generations_created_by') THEN
        CREATE INDEX idx_content_generations_created_by ON content_generations(created_by_id);
    END IF;
END $$;

-- Add trigger for updated_at
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_content_generations_updated_at'
    ) THEN
        CREATE TRIGGER update_content_generations_updated_at
            BEFORE UPDATE ON content_generations
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
