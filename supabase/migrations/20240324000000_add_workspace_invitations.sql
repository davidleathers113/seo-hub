-- Create workspace invitations table
CREATE TABLE IF NOT EXISTS workspace_invitations (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE workspace_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view invitations for their workspaces"
    ON workspace_invitations FOR SELECT
    USING (workspace_id IN (
        SELECT workspace_id FROM members WHERE user_id = auth.uid()
    ));

CREATE POLICY "Workspace owners and admins can manage invitations"
    ON workspace_invitations FOR ALL
    USING (workspace_id IN (
        SELECT workspace_id FROM members
        WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    ));

-- Create trigger for updated_at
CREATE TRIGGER handle_workspace_updated_at
    BEFORE UPDATE ON workspace_invitations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_workspace_updated_at();