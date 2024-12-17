-- Fix primary key issue for app_users table
DO $$
DECLARE
    constraint_exists boolean;
    has_primary_key boolean;
BEGIN
    -- Check if app_users already has any primary key
    SELECT EXISTS (
        SELECT FROM pg_constraint c
        JOIN pg_namespace n ON n.oid = c.connamespace
        WHERE n.nspname = 'public'
        AND c.conrelid = 'app_users'::regclass
        AND c.contype = 'p'
    ) INTO has_primary_key;

    -- If no primary key exists, add it
    IF NOT has_primary_key THEN
        -- Make sure the id column exists and is of type UUID
        IF NOT EXISTS (
            SELECT FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'app_users'
            AND column_name = 'id'
        ) THEN
            ALTER TABLE app_users ADD COLUMN id UUID DEFAULT uuid_generate_v4();
        END IF;

        -- Add the primary key constraint
        ALTER TABLE app_users ADD CONSTRAINT app_users_pkey PRIMARY KEY (id);
        RAISE NOTICE 'Added app_users_pkey constraint';
    ELSE
        RAISE NOTICE 'Primary key already exists on app_users table';
    END IF;

EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'Table app_users does not exist yet';
    WHEN duplicate_object THEN
        RAISE NOTICE 'Primary key constraint already exists on app_users table';
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Unexpected error while fixing primary key: %', SQLERRM;
END $$;