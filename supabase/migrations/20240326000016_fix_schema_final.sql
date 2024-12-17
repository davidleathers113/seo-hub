-- Drop all existing objects to ensure clean slate
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS pillars CASCADE;
DROP TABLE IF EXISTS niches CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS workspaces CASCADE;
DROP TABLE IF EXISTS app_users CASCADE;

-- Create app_users table with all constraints
CREATE TABLE app_users (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT app_users_pkey PRIMARY KEY (id),
    CONSTRAINT app_users_email_key UNIQUE (email),
    CONSTRAINT app_users_username_key UNIQUE (username)
);

-- Create profiles table with all constraints
CREATE TABLE profiles (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    user_id UUID NOT NULL,
    username VARCHAR(255),
    full_name VARCHAR(255),
    avatar_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT profiles_pkey PRIMARY KEY (id),
    CONSTRAINT profiles_username_key UNIQUE (username),
    CONSTRAINT fk_profiles_user FOREIGN KEY (user_id)
        REFERENCES app_users(id) ON DELETE CASCADE
);

-- Create workspaces table with all constraints
CREATE TABLE workspaces (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    owner_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT workspaces_pkey PRIMARY KEY (id),
    CONSTRAINT workspaces_slug_key UNIQUE (slug),
    CONSTRAINT fk_workspaces_owner FOREIGN KEY (owner_id)
        REFERENCES app_users(id) ON DELETE CASCADE
);

-- Create niches table with all constraints
CREATE TABLE niches (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    name VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL,
    workspace_id UUID NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT niches_pkey PRIMARY KEY (id),
    CONSTRAINT fk_niches_user FOREIGN KEY (user_id)
        REFERENCES app_users(id) ON DELETE CASCADE,
    CONSTRAINT fk_niches_workspace FOREIGN KEY (workspace_id)
        REFERENCES workspaces(id) ON DELETE CASCADE
);

-- Create pillars table with all constraints
CREATE TABLE pillars (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    title VARCHAR(255) NOT NULL,
    niche_id UUID NOT NULL,
    user_id UUID NOT NULL,
    workspace_id UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pillars_pkey PRIMARY KEY (id),
    CONSTRAINT fk_pillars_niche FOREIGN KEY (niche_id)
        REFERENCES niches(id) ON DELETE CASCADE,
    CONSTRAINT fk_pillars_user FOREIGN KEY (user_id)
        REFERENCES app_users(id) ON DELETE CASCADE,
    CONSTRAINT fk_pillars_workspace FOREIGN KEY (workspace_id)
        REFERENCES workspaces(id) ON DELETE CASCADE
);

-- Create articles table with all constraints
CREATE TABLE articles (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    pillar_id UUID NOT NULL,
    user_id UUID NOT NULL,
    workspace_id UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' NOT NULL,
    keywords TEXT[],
    meta_description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT articles_pkey PRIMARY KEY (id),
    CONSTRAINT fk_articles_pillar FOREIGN KEY (pillar_id)
        REFERENCES pillars(id) ON DELETE CASCADE,
    CONSTRAINT fk_articles_user FOREIGN KEY (user_id)
        REFERENCES app_users(id) ON DELETE CASCADE,
    CONSTRAINT fk_articles_workspace FOREIGN KEY (workspace_id)
        REFERENCES workspaces(id) ON DELETE CASCADE
);

-- Create required indexes
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

-- Enable RLS on all tables
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE niches ENABLE ROW LEVEL SECURITY;
ALTER TABLE pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies with correct naming convention
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