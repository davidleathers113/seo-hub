-- First drop all policies since we'll be altering columns used in them
DROP POLICY IF EXISTS "select_users_policy" ON users;
DROP POLICY IF EXISTS "update_users_policy" ON users;
DROP POLICY IF EXISTS "select_niches_policy" ON niches;
DROP POLICY IF EXISTS "insert_niches_policy" ON niches;
DROP POLICY IF EXISTS "update_niches_policy" ON niches;
DROP POLICY IF EXISTS "delete_niches_policy" ON niches;
DROP POLICY IF EXISTS "select_pillars_policy" ON pillars;
DROP POLICY IF EXISTS "insert_pillars_policy" ON pillars;
DROP POLICY IF EXISTS "update_pillars_policy" ON pillars;
DROP POLICY IF EXISTS "delete_pillars_policy" ON pillars;
DROP POLICY IF EXISTS "select_articles_policy" ON articles;
DROP POLICY IF EXISTS "insert_articles_policy" ON articles;
DROP POLICY IF EXISTS "update_articles_policy" ON articles;
DROP POLICY IF EXISTS "delete_articles_policy" ON articles;

-- Drop foreign key constraints before table rename
ALTER TABLE niches DROP CONSTRAINT IF EXISTS niches_user_id_fkey CASCADE;
ALTER TABLE pillars DROP CONSTRAINT IF EXISTS pillars_user_id_fkey CASCADE;
ALTER TABLE articles DROP CONSTRAINT IF EXISTS articles_user_id_fkey CASCADE;

-- Drop old trigger and index from users table
DROP TRIGGER IF EXISTS users_update_trigger ON users;
DROP INDEX IF EXISTS idx_users_email;

-- Rename users table to avoid reserved name conflict
ALTER TABLE users RENAME TO app_users;

-- Verify column types (now safe to do since policies are dropped)
ALTER TABLE app_users
    ALTER COLUMN id SET DATA TYPE UUID USING id::UUID,
    ALTER COLUMN id SET DEFAULT uuid_generate_v4(),
    ALTER COLUMN id SET NOT NULL,
    ALTER COLUMN created_at SET DATA TYPE TIMESTAMPTZ USING created_at::TIMESTAMPTZ,
    ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
    ALTER COLUMN created_at SET NOT NULL,
    ALTER COLUMN updated_at SET DATA TYPE TIMESTAMPTZ USING updated_at::TIMESTAMPTZ,
    ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP,
    ALTER COLUMN updated_at SET NOT NULL,
    ALTER COLUMN email SET DATA TYPE VARCHAR USING email::VARCHAR,
    ALTER COLUMN email SET NOT NULL;

-- Add missing indexes with correct naming pattern
DROP INDEX IF EXISTS idx_app_users_email_unique;
DROP INDEX IF EXISTS idx_app_users_created_at_ts;
CREATE UNIQUE INDEX idx_app_users_email ON app_users(email);
CREATE INDEX idx_app_users_created_at ON app_users(created_at);

-- Update function for better security and performance
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
STABLE
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS app_users_update_trigger ON app_users;

-- Create new trigger for renamed table
CREATE TRIGGER app_users_update_trigger
    BEFORE UPDATE ON app_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update foreign key references to point to app_users with explicit ON DELETE clauses
ALTER TABLE niches ADD CONSTRAINT niches_user_id_fkey FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE;
ALTER TABLE pillars ADD CONSTRAINT pillars_user_id_fkey FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE;
ALTER TABLE articles ADD CONSTRAINT articles_user_id_fkey FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE;

-- Create correctly named RLS policies with proper role definitions
CREATE POLICY "enable_select_for_app_users_policy" ON app_users
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "enable_update_for_app_users_policy" ON app_users
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "enable_select_for_niches_policy" ON niches
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "enable_insert_for_niches_policy" ON niches
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "enable_update_for_niches_policy" ON niches
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "enable_delete_for_niches_policy" ON niches
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "enable_select_for_pillars_policy" ON pillars
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "enable_insert_for_pillars_policy" ON pillars
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "enable_update_for_pillars_policy" ON pillars
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "enable_delete_for_pillars_policy" ON pillars
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "enable_select_for_articles_policy" ON articles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "enable_insert_for_articles_policy" ON articles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "enable_update_for_articles_policy" ON articles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "enable_delete_for_articles_policy" ON articles
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
