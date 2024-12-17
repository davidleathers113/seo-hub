-- Rename indexes to follow convention
ALTER INDEX IF EXISTS "users_email_idx" RENAME TO idx_users_email;
ALTER INDEX IF EXISTS "users_created_at_idx" RENAME TO idx_users_created_at;
ALTER INDEX IF EXISTS "profiles_user_id_idx" RENAME TO idx_profiles_user_id;
ALTER INDEX IF EXISTS "profiles_updated_at_idx" RENAME TO idx_profiles_updated_at;

-- Continue for other indexes...