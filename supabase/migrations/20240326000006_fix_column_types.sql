-- Add NOT NULL constraints to timestamp columns
ALTER TABLE app_users ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE app_users ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE niches ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE niches ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE pillars ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE pillars ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE articles ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE articles ALTER COLUMN updated_at SET NOT NULL;

-- Convert TEXT columns to VARCHAR
ALTER TABLE app_users ALTER COLUMN email TYPE VARCHAR USING email::VARCHAR;
ALTER TABLE app_users ALTER COLUMN name TYPE VARCHAR USING name::VARCHAR;
ALTER TABLE app_users ALTER COLUMN password TYPE VARCHAR USING password::VARCHAR;
ALTER TABLE app_users ALTER COLUMN token TYPE VARCHAR USING token::VARCHAR;
ALTER TABLE app_users ALTER COLUMN role TYPE VARCHAR USING role::VARCHAR;

ALTER TABLE niches ALTER COLUMN name TYPE VARCHAR USING name::VARCHAR;
ALTER TABLE niches ALTER COLUMN description TYPE VARCHAR USING description::VARCHAR;
ALTER TABLE niches ALTER COLUMN status TYPE VARCHAR USING status::VARCHAR;

ALTER TABLE pillars ALTER COLUMN title TYPE VARCHAR USING title::VARCHAR;
ALTER TABLE pillars ALTER COLUMN status TYPE VARCHAR USING status::VARCHAR;

ALTER TABLE articles ALTER COLUMN title TYPE VARCHAR USING title::VARCHAR;
ALTER TABLE articles ALTER COLUMN status TYPE VARCHAR USING status::VARCHAR;
ALTER TABLE articles ALTER COLUMN meta_description TYPE VARCHAR USING meta_description::VARCHAR;

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_app_users_created_at ON app_users(created_at);

-- Drop and recreate foreign key constraints with proper names
ALTER TABLE niches DROP CONSTRAINT IF EXISTS niches_user_id_fkey;
ALTER TABLE niches ADD CONSTRAINT fk_niches_user FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE;

ALTER TABLE pillars DROP CONSTRAINT IF EXISTS pillars_user_id_fkey;
ALTER TABLE pillars ADD CONSTRAINT fk_pillars_user FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE;

ALTER TABLE articles DROP CONSTRAINT IF EXISTS articles_user_id_fkey;
ALTER TABLE articles ADD CONSTRAINT fk_articles_user FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE;
