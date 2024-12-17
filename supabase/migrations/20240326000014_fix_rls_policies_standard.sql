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

-- Create policies for app_users
CREATE POLICY select_app_users ON app_users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY update_app_users ON app_users
    FOR UPDATE USING (auth.uid() = id);

-- Create policies for profiles
CREATE POLICY select_profiles ON profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY update_profiles ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY insert_profiles ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for workspaces
CREATE POLICY select_workspaces ON workspaces
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY update_workspaces ON workspaces
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY insert_workspaces ON workspaces
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY delete_workspaces ON workspaces
    FOR DELETE USING (auth.uid() = owner_id);

-- Create policies for niches
CREATE POLICY select_niches ON niches
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY update_niches ON niches
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY insert_niches ON niches
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY delete_niches ON niches
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for pillars
CREATE POLICY select_pillars ON pillars
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY update_pillars ON pillars
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY insert_pillars ON pillars
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY delete_pillars ON pillars
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for articles
CREATE POLICY select_articles ON articles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY update_articles ON articles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY insert_articles ON articles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY delete_articles ON articles
    FOR DELETE USING (auth.uid() = user_id);