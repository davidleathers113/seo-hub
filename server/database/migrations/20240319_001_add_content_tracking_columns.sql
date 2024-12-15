-- Update existing research relevance values to be within valid range
UPDATE research 
SET relevance = CASE
    WHEN relevance > 100 THEN 1.0
    WHEN relevance < 0 THEN 0.0
    ELSE relevance::decimal / 100
END
WHERE relevance > 1 OR relevance < 0;

-- Modify research table to use decimal for relevance
ALTER TABLE research
ALTER COLUMN relevance TYPE DECIMAL(3,2) USING (
    CASE
        WHEN relevance > 100 THEN 1.0
        WHEN relevance < 0 THEN 0.0
        ELSE relevance::decimal / 100
    END
);

-- Add constraint to research relevance
ALTER TABLE research
ADD CONSTRAINT valid_relevance 
CHECK (relevance >= 0 AND relevance <= 1);

-- Add AI generation tracking columns to pillars
ALTER TABLE pillars
ADD COLUMN IF NOT EXISTS generated_by VARCHAR(50),
ADD COLUMN IF NOT EXISTS generation_prompt TEXT,
ADD COLUMN IF NOT EXISTS generation_timestamp TIMESTAMP WITH TIME ZONE;

-- Add description to subpillars if it doesn't exist
ALTER TABLE subpillars
ADD COLUMN IF NOT EXISTS description TEXT;

-- Update any invalid status values to 'research'
UPDATE subpillars 
SET status = 'research'
WHERE status NOT IN ('research', 'outline', 'draft', 'complete');

-- Add status constraint to subpillars if it doesn't exist
DO $$ 
BEGIN
    ALTER TABLE subpillars
    ADD CONSTRAINT valid_status 
    CHECK (status IN ('research', 'outline', 'draft', 'complete'));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Update any invalid progress values in niches
UPDATE niches 
SET progress = CASE
    WHEN progress < 0 THEN 0
    WHEN progress > 100 THEN 100
    ELSE progress
END;

-- Add progress constraint to niches if it doesn't exist
DO $$ 
BEGIN
    ALTER TABLE niches
    ADD CONSTRAINT valid_progress 
    CHECK (progress >= 0 AND progress <= 100);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create index for AI generation queries if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_pillars_generated') THEN
        CREATE INDEX idx_pillars_generated ON pillars(generated_by, generation_timestamp);
    END IF;
END $$;
