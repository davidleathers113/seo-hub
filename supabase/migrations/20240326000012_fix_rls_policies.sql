-- Drop and recreate RLS policies with correct naming
DO $$
BEGIN
    -- Drop all existing policies
    DROP POLICY IF EXISTS "select_app_users_policy" ON app_users;
    DROP POLICY IF EXISTS "update_app_users_policy" ON app_users;
    DROP POLICY IF EXISTS "select_profiles_policy" ON profiles;
    DROP POLICY IF EXISTS "update_profiles_policy" ON profiles;
    DROP POLICY IF EXISTS "create_profiles_policy" ON profiles;
    DROP POLICY IF EXISTS "select_workspaces_policy" ON workspaces;
    DROP POLICY IF EXISTS "update_workspaces_policy" ON workspaces;
    DROP POLICY IF EXISTS "create_workspaces_policy" ON workspaces;
    DROP POLICY IF EXISTS "delete_workspaces_policy" ON workspaces;
    DROP POLICY IF EXISTS "select_niches_policy" ON niches;
    DROP POLICY IF EXISTS "update_niches_policy" ON niches;
    DROP POLICY IF EXISTS "create_niches_policy" ON niches;
    DROP POLICY IF EXISTS "delete_niches_policy" ON niches;
    DROP POLICY IF EXISTS "select_pillars_policy" ON pillars;
    DROP POLICY IF EXISTS "update_pillars_policy" ON pillars;
    DROP POLICY IF EXISTS "create_pillars_policy" ON pillars;
    DROP POLICY IF EXISTS "delete_pillars_policy" ON pillars;
    DROP POLICY IF EXISTS "select_articles_policy" ON articles;
    DROP POLICY IF EXISTS "update_articles_policy" ON articles;
    DROP POLICY IF EXISTS "create_articles_policy" ON articles;
    DROP POLICY IF EXISTS "delete_articles_policy" ON articles;

    -- Create policies for app_users
    CREATE POLICY "select_app_users_policy_v1"
        ON app_users FOR SELECT
        USING (auth.uid() = id);

    CREATE POLICY "update_app_users_policy_v1"
        ON app_users FOR UPDATE
        USING (auth.uid() = id);

    -- Create policies for profiles
    CREATE POLICY "select_profiles_policy_v1"
        ON profiles FOR SELECT
        USING (auth.uid() = user_id);

    CREATE POLICY "update_profiles_policy_v1"
        ON profiles FOR UPDATE
        USING (auth.uid() = user_id);

    CREATE POLICY "insert_profiles_policy_v1"
        ON profiles FOR INSERT
        WITH CHECK (auth.uid() = user_id);

    -- Create policies for workspaces
    CREATE POLICY "select_workspaces_policy_v1"
        ON workspaces FOR SELECT
        USING (auth.uid() = owner_id);

    CREATE POLICY "update_workspaces_policy_v1"
        ON workspaces FOR UPDATE
        USING (auth.uid() = owner_id);

    CREATE POLICY "insert_workspaces_policy_v1"
        ON workspaces FOR INSERT
        WITH CHECK (auth.uid() = owner_id);

    CREATE POLICY "delete_workspaces_policy_v1"
        ON workspaces FOR DELETE
        USING (auth.uid() = owner_id);

    -- Create policies for niches
    CREATE POLICY "select_niches_policy_v2"
        ON niches FOR SELECT
        USING (auth.uid() = user_id);

    CREATE POLICY "update_niches_policy_v2"
        ON niches FOR UPDATE
        USING (auth.uid() = user_id);

    CREATE POLICY "insert_niches_policy_v2"
        ON niches FOR INSERT
        WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "delete_niches_policy_v2"
        ON niches FOR DELETE
        USING (auth.uid() = user_id);

    -- Create policies for pillars
    CREATE POLICY "select_pillars_policy_v2"
        ON pillars FOR SELECT
        USING (auth.uid() = user_id);

    CREATE POLICY "update_pillars_policy_v2"
        ON pillars FOR UPDATE
        USING (auth.uid() = user_id);

    CREATE POLICY "insert_pillars_policy_v2"
        ON pillars FOR INSERT
        WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "delete_pillars_policy_v2"
        ON pillars FOR DELETE
        USING (auth.uid() = user_id);

    -- Create policies for articles
    CREATE POLICY "select_articles_policy_v2"
        ON articles FOR SELECT
        USING (auth.uid() = user_id);

    CREATE POLICY "update_articles_policy_v2"
        ON articles FOR UPDATE
        USING (auth.uid() = user_id);

    CREATE POLICY "insert_articles_policy_v2"
        ON articles FOR INSERT
        WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "delete_articles_policy_v2"
        ON articles FOR DELETE
        USING (auth.uid() = user_id);

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error fixing RLS policies: %', SQLERRM;
END $$;