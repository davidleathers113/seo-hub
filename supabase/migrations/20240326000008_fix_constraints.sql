-- Add missing constraints
DO $$
DECLARE
    constraint_exists boolean;
BEGIN
    -- app_users email unique constraint
    SELECT EXISTS (
        SELECT FROM pg_constraint c
        JOIN pg_namespace n ON n.oid = c.connamespace
        WHERE n.nspname = 'public'
        AND c.conname = 'app_users_email_key'
        AND c.contype = 'u'
    ) INTO constraint_exists;

    IF NOT constraint_exists THEN
        ALTER TABLE app_users ADD CONSTRAINT app_users_email_key UNIQUE (email);
        RAISE NOTICE 'Added app_users_email_key constraint';
    END IF;

    -- profiles foreign key constraint (only if table exists)
    IF EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'profiles'
    ) THEN
        SELECT EXISTS (
            SELECT FROM pg_constraint c
            JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE n.nspname = 'public'
            AND c.conname = 'fk_profiles_user'
            AND c.contype = 'f'
        ) INTO constraint_exists;

        IF NOT constraint_exists THEN
            ALTER TABLE profiles
            ADD CONSTRAINT fk_profiles_user
            FOREIGN KEY (user_id)
            REFERENCES app_users(id)
            ON DELETE CASCADE;
            RAISE NOTICE 'Added fk_profiles_user constraint';
        END IF;
    END IF;

    -- workspaces foreign key constraint (only if table exists)
    IF EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'workspaces'
    ) THEN
        SELECT EXISTS (
            SELECT FROM pg_constraint c
            JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE n.nspname = 'public'
            AND c.conname = 'fk_workspaces_owner'
            AND c.contype = 'f'
        ) INTO constraint_exists;

        IF NOT constraint_exists THEN
            ALTER TABLE workspaces
            ADD CONSTRAINT fk_workspaces_owner
            FOREIGN KEY (owner_id)
            REFERENCES app_users(id)
            ON DELETE CASCADE;
            RAISE NOTICE 'Added fk_workspaces_owner constraint';
        END IF;
    END IF;
EXCEPTION
    WHEN undefined_table THEN
        RAISE EXCEPTION 'Table does not exist: %', SQLERRM;
    WHEN duplicate_object THEN
        RAISE EXCEPTION 'Constraint already exists: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Unexpected error while adding constraints: %', SQLERRM;
END $$;

-- Add missing indexes
DO $$
BEGIN
    -- app_users indexes
    IF NOT EXISTS (
        SELECT FROM pg_indexes
        WHERE schemaname = 'public'
        AND indexname = 'idx_app_users_email'
    ) THEN
        CREATE INDEX idx_app_users_email ON app_users(email);
        RAISE NOTICE 'Created idx_app_users_email index';
    END IF;

    IF NOT EXISTS (
        SELECT FROM pg_indexes
        WHERE schemaname = 'public'
        AND indexname = 'idx_app_users_created_at'
    ) THEN
        CREATE INDEX idx_app_users_created_at ON app_users(created_at);
        RAISE NOTICE 'Created idx_app_users_created_at index';
    END IF;

    -- profiles indexes (only if table exists)
    IF EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'profiles'
    ) THEN
        IF NOT EXISTS (
            SELECT FROM pg_indexes
            WHERE schemaname = 'public'
            AND indexname = 'idx_profiles_user_id'
        ) THEN
            CREATE INDEX idx_profiles_user_id ON profiles(user_id);
            RAISE NOTICE 'Created idx_profiles_user_id index';
        END IF;

        IF NOT EXISTS (
            SELECT FROM pg_indexes
            WHERE schemaname = 'public'
            AND indexname = 'idx_profiles_updated_at'
        ) THEN
            CREATE INDEX idx_profiles_updated_at ON profiles(updated_at);
            RAISE NOTICE 'Created idx_profiles_updated_at index';
        END IF;
    END IF;
EXCEPTION
    WHEN undefined_table THEN
        RAISE EXCEPTION 'Table does not exist: %', SQLERRM;
    WHEN duplicate_table THEN
        RAISE EXCEPTION 'Index already exists: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Unexpected error while creating indexes: %', SQLERRM;
END $$;
