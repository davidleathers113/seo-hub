-- Drop existing views
DROP VIEW IF EXISTS validation_policies CASCADE;
DROP VIEW IF EXISTS validation_columns CASCADE;
DROP VIEW IF EXISTS validation_indexes CASCADE;

-- Create helper views for validation
CREATE VIEW validation_policies AS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd as operation,
    qual as definition,
    with_check,
    roles
FROM pg_catalog.pg_policies 
WHERE schemaname = 'public';

CREATE VIEW validation_columns AS
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public';

CREATE VIEW validation_indexes AS
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_catalog.pg_indexes 
WHERE schemaname = 'public';

-- Grant permissions to service role
GRANT SELECT ON validation_policies TO service_role;
GRANT SELECT ON validation_columns TO service_role;
GRANT SELECT ON validation_indexes TO service_role;

-- Update validators to use views
COMMENT ON VIEW validation_policies IS 'Helper view for RLS policy validation';
COMMENT ON VIEW validation_columns IS 'Helper view for column type validation';
COMMENT ON VIEW validation_indexes IS 'Helper view for index validation';
