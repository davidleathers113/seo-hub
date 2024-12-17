-- Fix remaining constraints and indexes
DO $$
DECLARE
    constraint_exists boolean;
BEGIN
    -- Add missing indexes for app_users
    IF NOT EXISTS (
        SELECT FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename = 'app_users'
        AND indexname = 'idx_app_users_email'
    ) THEN
        CREATE INDEX idx_app_users_email ON app_users(email);
    END IF;

    IF NOT EXISTS (
        SELECT FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename = 'app_users'
        AND indexname = 'idx_app_users_created_at'
    ) THEN
        CREATE INDEX idx_app_users_created_at ON app_users(created_at);
    END IF;

    -- Add missing indexes for profiles
    IF EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'profiles'
    ) THEN
        IF NOT EXISTS (
            SELECT FROM pg_indexes
            WHERE schemaname = 'public'
            AND tablename = 'profiles'
            AND indexname = 'idx_profiles_user_id'
        ) THEN
            CREATE INDEX idx_profiles_user_id ON profiles(user_id);
        END IF;

        IF NOT EXISTS (
            SELECT FROM pg_indexes
            WHERE schemaname = 'public'
            AND tablename = 'profiles'
            AND indexname = 'idx_profiles_updated_at'
        ) THEN
            CREATE INDEX idx_profiles_updated_at ON profiles(updated_at);
        END IF;

        -- Add profiles primary key if missing
        SELECT EXISTS (
            SELECT FROM pg_constraint
            WHERE conname = 'profiles_pkey'
        ) INTO constraint_exists;

        IF NOT constraint_exists THEN
            ALTER TABLE profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
        END IF;
    END IF;

    -- Add workspaces primary key if missing
    IF EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'workspaces'
    ) THEN
        SELECT EXISTS (
            SELECT FROM pg_constraint
            WHERE conname = 'workspaces_pkey'
        ) INTO constraint_exists;

        IF NOT constraint_exists THEN
            ALTER TABLE workspaces ADD CONSTRAINT workspaces_pkey PRIMARY KEY (id);
        END IF;
    END IF;

    -- Fix foreign key constraints
    IF EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'profiles'
    ) THEN
        -- Drop existing invalid foreign key if it exists
        ALTER TABLE profiles DROP CONSTRAINT IF EXISTS fk_profiles_user;

        -- Add correct foreign key
        ALTER TABLE profiles
        ADD CONSTRAINT fk_profiles_user
        FOREIGN KEY (user_id)
        REFERENCES app_users(id)
        ON DELETE CASCADE;
    END IF;

    IF EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'workspaces'
    ) THEN
        -- Drop existing invalid foreign key if it exists
        ALTER TABLE workspaces DROP CONSTRAINT IF EXISTS fk_workspaces_owner;

        -- Add correct foreign key
        ALTER TABLE workspaces
        ADD CONSTRAINT fk_workspaces_owner
        FOREIGN KEY (owner_id)
        REFERENCES app_users(id)
        ON DELETE CASCADE;
    END IF;

    -- Add recommended username constraint for app_users if missing
    SELECT EXISTS (
        SELECT FROM pg_constraint
        WHERE conname = 'app_users_username_key'
    ) INTO constraint_exists;

    IF NOT constraint_exists AND EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'app_users'
        AND column_name = 'username'
    ) THEN
        ALTER TABLE app_users ADD CONSTRAINT app_users_username_key UNIQUE (username);
    END IF;

EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'Table does not exist yet';
    WHEN duplicate_object THEN
        RAISE NOTICE 'Constraint or index already exists';
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Unexpected error: %', SQLERRM;
END $$;