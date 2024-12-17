-- Drop existing policies
DROP POLICY IF EXISTS select_app_users ON app_users;
DROP POLICY IF EXISTS update_app_users ON app_users;
DROP POLICY IF EXISTS select_profiles ON profiles;
DROP POLICY IF EXISTS update_profiles ON profiles;
DROP POLICY IF EXISTS insert_profiles ON profiles;
DROP POLICY IF EXISTS select_workspaces ON workspaces;
DROP POLICY IF EXISTS update_workspaces ON workspaces;
DROP POLICY IF EXISTS insert_workspaces ON workspaces;
DROP POLICY IF EXISTS delete_workspaces ON workspaces;
DROP POLICY IF EXISTS select_niches ON niches;
DROP POLICY IF EXISTS update_niches ON niches;
DROP POLICY IF EXISTS insert_niches ON niches;
DROP POLICY IF EXISTS delete_niches ON niches;
DROP POLICY IF EXISTS select_pillars ON pillars;
DROP POLICY IF EXISTS update_pillars ON pillars;
DROP POLICY IF EXISTS insert_pillars ON pillars;
DROP POLICY IF EXISTS delete_pillars ON pillars;
DROP POLICY IF EXISTS select_articles ON articles;
DROP POLICY IF EXISTS update_articles ON articles;
DROP POLICY IF EXISTS insert_articles ON articles;
DROP POLICY IF EXISTS delete_articles ON articles;

-- Drop existing indexes
DROP INDEX IF EXISTS idx_app_users_email;
DROP INDEX IF EXISTS idx_app_users_created_at;
DROP INDEX IF EXISTS idx_profiles_user_id;
DROP INDEX IF EXISTS idx_profiles_updated_at;
DROP INDEX IF EXISTS idx_workspaces_owner_id;
DROP INDEX IF EXISTS idx_workspaces_slug;
DROP INDEX IF EXISTS idx_niches_user_id;
DROP INDEX IF EXISTS idx_niches_workspace_id;
DROP INDEX IF EXISTS idx_pillars_niche_id;
DROP INDEX IF EXISTS idx_pillars_user_id;
DROP INDEX IF EXISTS idx_pillars_workspace_id;
DROP INDEX IF EXISTS idx_articles_pillar_id;
DROP INDEX IF EXISTS idx_articles_user_id;
DROP INDEX IF EXISTS idx_articles_workspace_id;

-- Recreate indexes with correct naming convention
CREATE INDEX idx_app_users_email ON app_users(email);
CREATE INDEX idx_app_users_created_at ON app_users(created_at);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_updated_at ON profiles(updated_at);
CREATE INDEX idx_workspaces_owner_id ON workspaces(owner_id);
CREATE INDEX idx_workspaces_slug ON workspaces(slug);
CREATE INDEX idx_niches_user_id ON niches(user_id);
CREATE INDEX idx_niches_workspace_id ON niches(workspace_id);
CREATE INDEX idx_pillars_niche_id ON pillars(niche_id);
CREATE INDEX idx_pillars_user_id ON pillars(user_id);
CREATE INDEX idx_pillars_workspace_id ON pillars(workspace_id);
CREATE INDEX idx_articles_pillar_id ON articles(pillar_id);
CREATE INDEX idx_articles_user_id ON articles(user_id);
CREATE INDEX idx_articles_workspace_id ON articles(workspace_id);

-- Add missing constraints
ALTER TABLE app_users ADD CONSTRAINT app_users_pkey PRIMARY KEY (id);
ALTER TABLE app_users ADD CONSTRAINT app_users_email_key UNIQUE (email);
ALTER TABLE app_users ADD CONSTRAINT app_users_username_key UNIQUE (username);

ALTER TABLE profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_user
    FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE;

ALTER TABLE workspaces ADD CONSTRAINT workspaces_pkey PRIMARY KEY (id);
ALTER TABLE workspaces ADD CONSTRAINT fk_workspaces_owner
    FOREIGN KEY (owner_id) REFERENCES app_users(id) ON DELETE CASCADE;

-- Create policies with correct naming convention
CREATE POLICY select_app_users_policy ON app_users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY update_app_users_policy ON app_users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY select_profiles_policy ON profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY update_profiles_policy ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY insert_profiles_policy ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY select_workspaces_policy ON workspaces
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY update_workspaces_policy ON workspaces
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY insert_workspaces_policy ON workspaces
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY delete_workspaces_policy ON workspaces
    FOR DELETE USING (auth.uid() = owner_id);

CREATE POLICY select_niches_policy ON niches
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY update_niches_policy ON niches
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY insert_niches_policy ON niches
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY delete_niches_policy ON niches
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY select_pillars_policy ON pillars
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY update_pillars_policy ON pillars
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY insert_pillars_policy ON pillars
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY delete_pillars_policy ON pillars
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY select_articles_policy ON articles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY update_articles_policy ON articles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY insert_articles_policy ON articles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY delete_articles_policy ON articles
    FOR DELETE USING (auth.uid() = user_id);