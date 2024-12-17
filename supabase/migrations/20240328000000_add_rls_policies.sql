-- Enable RLS on all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_templates ENABLE ROW LEVEL SECURITY;

-- Workspaces policies
CREATE POLICY "Users can view workspaces they are members of"
    ON workspaces
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM members
            WHERE members.workspace_id = workspaces.id
            AND members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create workspaces"
    ON workspaces
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Only workspace owners can update workspace"
    ON workspaces
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM members
            WHERE members.workspace_id = workspaces.id
            AND members.user_id = auth.uid()
            AND members.role = 'owner'
        )
    );

-- Members policies
CREATE POLICY "Users can view members of their workspaces"
    ON members
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM members m2
            WHERE m2.workspace_id = members.workspace_id
            AND m2.user_id = auth.uid()
        )
    );

CREATE POLICY "Only workspace admins can manage members"
    ON members
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM members m2
            WHERE m2.workspace_id = members.workspace_id
            AND m2.user_id = auth.uid()
            AND m2.role IN ('owner', 'admin')
        )
    );

-- Workspace invitations policies
CREATE POLICY "Users can view invitations sent to their email"
    ON workspace_invitations
    FOR SELECT
    USING (
        email IN (
            SELECT email FROM auth.users
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Workspace admins can create invitations"
    ON workspace_invitations
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM members
            WHERE members.workspace_id = workspace_invitations.workspace_id
            AND members.user_id = auth.uid()
            AND members.role IN ('owner', 'admin')
        )
    );

-- Workspace stats policies
CREATE POLICY "Users can view stats of their workspaces"
    ON workspace_stats
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM members
            WHERE members.workspace_id = workspace_stats.workspace_id
            AND members.user_id = auth.uid()
        )
    );

-- Workspace quotas policies
CREATE POLICY "Users can view quotas of their workspaces"
    ON workspace_quotas
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM members
            WHERE members.workspace_id = workspace_quotas.workspace_id
            AND members.user_id = auth.uid()
        )
    );

-- Workspace audit logs policies
CREATE POLICY "Users can view audit logs of their workspaces"
    ON workspace_audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM members
            WHERE members.workspace_id = workspace_audit_logs.workspace_id
            AND members.user_id = auth.uid()
        )
    );

-- Workspace templates policies
CREATE POLICY "Users can view public templates"
    ON workspace_templates
    FOR SELECT
    USING (is_public = true);

CREATE POLICY "Users can view their own templates"
    ON workspace_templates
    FOR SELECT
    USING (created_by = auth.uid());

CREATE POLICY "Users can manage their own templates"
    ON workspace_templates
    FOR ALL
    USING (created_by = auth.uid());