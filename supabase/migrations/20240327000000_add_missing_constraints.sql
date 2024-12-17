-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email);
CREATE INDEX IF NOT EXISTS idx_app_users_created_at ON app_users(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at);

-- Add missing primary keys
ALTER TABLE app_users ADD CONSTRAINT app_users_pkey PRIMARY KEY (id);
ALTER TABLE profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
ALTER TABLE workspaces ADD CONSTRAINT workspaces_pkey PRIMARY KEY (id);

-- Add unique constraints
ALTER TABLE app_users ADD CONSTRAINT app_users_email_key UNIQUE (email);
ALTER TABLE app_users ADD CONSTRAINT app_users_username_key UNIQUE (username);

-- Fix foreign key constraints
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_user
  FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE;

ALTER TABLE workspaces ADD CONSTRAINT fk_workspaces_owner
  FOREIGN KEY (owner_id) REFERENCES app_users(id) ON DELETE CASCADE;