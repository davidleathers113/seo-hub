-- Drop existing tables
DROP TABLE IF EXISTS articles;
DROP TABLE IF EXISTS pillars;
DROP TABLE IF EXISTS niches;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS workspaces;
DROP TABLE IF EXISTS app_users;

-- Create app_users table
CREATE TABLE app_users (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (id)
);

ALTER TABLE app_users ADD CONSTRAINT app_users_email_key UNIQUE (email);

-- Create profiles table
CREATE TABLE profiles (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    user_id UUID NOT NULL,
    username VARCHAR(255),
    full_name VARCHAR(255),
    avatar_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (id)
);

ALTER TABLE profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_user
    FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE;

-- Create workspaces table
CREATE TABLE workspaces (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    owner_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (id)
);

ALTER TABLE workspaces ADD CONSTRAINT workspaces_slug_key UNIQUE (slug);
ALTER TABLE workspaces ADD CONSTRAINT fk_workspaces_owner
    FOREIGN KEY (owner_id) REFERENCES app_users(id) ON DELETE CASCADE;

-- Create niches table
CREATE TABLE niches (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    name VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL,
    workspace_id UUID NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (id)
);

ALTER TABLE niches ADD CONSTRAINT fk_niches_user
    FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE;
ALTER TABLE niches ADD CONSTRAINT fk_niches_workspace
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- Create pillars table
CREATE TABLE pillars (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    title VARCHAR(255) NOT NULL,
    niche_id UUID NOT NULL,
    user_id UUID NOT NULL,
    workspace_id UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (id)
);

ALTER TABLE pillars ADD CONSTRAINT fk_pillars_niche
    FOREIGN KEY (niche_id) REFERENCES niches(id) ON DELETE CASCADE;
ALTER TABLE pillars ADD CONSTRAINT fk_pillars_user
    FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE;
ALTER TABLE pillars ADD CONSTRAINT fk_pillars_workspace
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- Create articles table
CREATE TABLE articles (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    pillar_id UUID NOT NULL,
    user_id UUID NOT NULL,
    workspace_id UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' NOT NULL,
    keywords TEXT[], -- Using TEXT[] for PostgreSQL array type
    meta_description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (id)
);

ALTER TABLE articles ADD CONSTRAINT fk_articles_pillar
    FOREIGN KEY (pillar_id) REFERENCES pillars(id) ON DELETE CASCADE;
ALTER TABLE articles ADD CONSTRAINT fk_articles_user
    FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE;
ALTER TABLE articles ADD CONSTRAINT fk_articles_workspace
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- Create indexes
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

-- Enable RLS
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE niches ENABLE ROW LEVEL SECURITY;
ALTER TABLE pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;