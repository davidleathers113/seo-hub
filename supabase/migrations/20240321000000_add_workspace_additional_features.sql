-- Create workspace stats table
CREATE TABLE IF NOT EXISTS workspace_stats (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    member_count INTEGER DEFAULT 0,
    storage_used BIGINT DEFAULT 0,
    api_calls INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create workspace quotas table
CREATE TABLE IF NOT EXISTS workspace_quotas (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    max_members INTEGER DEFAULT 5,
    max_storage BIGINT DEFAULT 5368709120, -- 5GB in bytes
    max_api_calls INTEGER DEFAULT 10000,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create workspace audit logs table
CREATE TABLE IF NOT EXISTS workspace_audit_logs (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create workspace backups table
CREATE TABLE IF NOT EXISTS workspace_backups (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    backup_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create workspace templates table
CREATE TABLE IF NOT EXISTS workspace_templates (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    config JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create workspace settings table
CREATE TABLE IF NOT EXISTS workspace_settings (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create workspace invoices table
CREATE TABLE IF NOT EXISTS workspace_invoices (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'usd',
    status TEXT DEFAULT 'pending',
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Now drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their workspace stats" ON workspace_stats;
DROP POLICY IF EXISTS "Users can view their workspace quotas" ON workspace_quotas;
DROP POLICY IF EXISTS "Users can view their workspace audit logs" ON workspace_audit_logs;
DROP POLICY IF EXISTS "Only workspace owners can manage backups" ON workspace_backups;
DROP POLICY IF EXISTS "Anyone can view public templates" ON workspace_templates;
DROP POLICY IF EXISTS "Users can manage their workspace invitations" ON workspace_invitations;
DROP POLICY IF EXISTS "Users can view their workspace settings" ON workspace_settings;
DROP POLICY IF EXISTS "Only workspace owners can manage settings" ON workspace_settings;
DROP POLICY IF EXISTS "Users can view their workspace invoices" ON workspace_invoices;

-- Create new policies
CREATE POLICY "Users can view their workspace stats"
ON workspace_stats FOR SELECT
USING (workspace_id IN (
    SELECT workspace_id FROM members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can view their workspace quotas"
ON workspace_quotas FOR SELECT
USING (workspace_id IN (
    SELECT workspace_id FROM members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can view their workspace audit logs"
ON workspace_audit_logs FOR SELECT
USING (workspace_id IN (
    SELECT workspace_id FROM members WHERE user_id = auth.uid()
));

CREATE POLICY "Only workspace owners can manage backups"
ON workspace_backups
USING (workspace_id IN (
    SELECT workspace_id FROM members WHERE user_id = auth.uid() AND role = 'owner'
));

CREATE POLICY "Anyone can view public templates"
ON workspace_templates FOR SELECT
USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can view their workspace settings"
ON workspace_settings FOR SELECT
USING (workspace_id IN (
    SELECT workspace_id FROM members WHERE user_id = auth.uid()
));

CREATE POLICY "Only workspace owners can manage settings"
ON workspace_settings FOR UPDATE
USING (workspace_id IN (
    SELECT workspace_id FROM members WHERE user_id = auth.uid() AND role = 'owner'
));

CREATE POLICY "Users can view their workspace invoices"
ON workspace_invoices FOR SELECT
USING (workspace_id IN (
    SELECT workspace_id FROM members WHERE user_id = auth.uid()
));