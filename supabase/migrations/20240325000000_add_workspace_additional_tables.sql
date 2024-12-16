-- Create workspace_stats table
CREATE TABLE workspace_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  storage_used BIGINT DEFAULT 0,
  api_calls_count INTEGER DEFAULT 0,
  active_users_count INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workspace_quotas table
CREATE TABLE workspace_quotas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  max_storage_gb INTEGER DEFAULT 5,
  max_members INTEGER DEFAULT 5,
  max_api_calls INTEGER DEFAULT 1000,
  quota_reset_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workspace_audit_logs table
CREATE TABLE workspace_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(255),
  resource_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workspace_backups table
CREATE TABLE workspace_backups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  backup_path TEXT NOT NULL,
  size_bytes BIGINT,
  status VARCHAR(50) DEFAULT 'pending',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workspace_templates table
CREATE TABLE workspace_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  content JSONB NOT NULL,
  is_public BOOLEAN DEFAULT false,
  category VARCHAR(100),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workspace_settings table
CREATE TABLE workspace_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  theme VARCHAR(50) DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT true,
  default_language VARCHAR(10) DEFAULT 'en',
  custom_domain TEXT,
  features JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id)
);

-- Create workspace_invoices table
CREATE TABLE workspace_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'pending',
  billing_period_start TIMESTAMPTZ,
  billing_period_end TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  invoice_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE workspace_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_invoices ENABLE ROW LEVEL SECURITY;

-- Stats policies
CREATE POLICY "Allow workspace members to view stats"
  ON workspace_stats FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM members
    WHERE members.workspace_id = workspace_stats.workspace_id
    AND members.user_id = auth.uid()
  ));

-- Quotas policies
CREATE POLICY "Allow workspace members to view quotas"
  ON workspace_quotas FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM members
    WHERE members.workspace_id = workspace_quotas.workspace_id
    AND members.user_id = auth.uid()
  ));

-- Audit logs policies
CREATE POLICY "Allow workspace admins to view audit logs"
  ON workspace_audit_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM members
    WHERE members.workspace_id = workspace_audit_logs.workspace_id
    AND members.user_id = auth.uid()
    AND members.role = 'admin'
  ));

-- Backups policies
CREATE POLICY "Allow workspace admins to manage backups"
  ON workspace_backups FOR ALL
  USING (EXISTS (
    SELECT 1 FROM members
    WHERE members.workspace_id = workspace_backups.workspace_id
    AND members.user_id = auth.uid()
    AND members.role = 'admin'
  ));

-- Templates policies
CREATE POLICY "Allow public template access"
  ON workspace_templates FOR SELECT
  USING (is_public = true);

CREATE POLICY "Allow workspace members to view private templates"
  ON workspace_templates FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM members
    WHERE members.workspace_id = workspace_templates.workspace_id
    AND members.user_id = auth.uid()
  ));

CREATE POLICY "Allow workspace admins to manage templates"
  ON workspace_templates FOR ALL
  USING (EXISTS (
    SELECT 1 FROM members
    WHERE members.workspace_id = workspace_templates.workspace_id
    AND members.user_id = auth.uid()
    AND members.role = 'admin'
  ));

-- Settings policies
CREATE POLICY "Allow workspace members to view settings"
  ON workspace_settings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM members
    WHERE members.workspace_id = workspace_settings.workspace_id
    AND members.user_id = auth.uid()
  ));

CREATE POLICY "Allow workspace admins to manage settings"
  ON workspace_settings FOR ALL
  USING (EXISTS (
    SELECT 1 FROM members
    WHERE members.workspace_id = workspace_settings.workspace_id
    AND members.user_id = auth.uid()
    AND members.role = 'admin'
  ));

-- Invoices policies
CREATE POLICY "Allow workspace admins to view invoices"
  ON workspace_invoices FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM members
    WHERE members.workspace_id = workspace_invoices.workspace_id
    AND members.user_id = auth.uid()
    AND members.role = 'admin'
  ));