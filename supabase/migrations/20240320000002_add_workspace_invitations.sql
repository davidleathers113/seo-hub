-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view invitations for their workspaces" ON workspace_invitations;
DROP POLICY IF EXISTS "Workspace owners and admins can manage invitations" ON workspace_invitations;

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

-- Create policies for workspace invitations
create policy "Users can view invitations for their workspaces"
    on public.workspace_invitations for select
    using (workspace_id in (
        select workspace_id from members
        where user_id = auth.uid()
    ));

create policy "Workspace owners and admins can insert invitations"
    on public.workspace_invitations for insert
    with check (workspace_id in (
        select workspace_id from members
        where user_id = auth.uid()
        and role in ('owner', 'admin')
    ));

create policy "Workspace owners and admins can update invitations"
    on public.workspace_invitations for update
    using (workspace_id in (
        select workspace_id from members
        where user_id = auth.uid()
        and role in ('owner', 'admin')
    ))
    with check (workspace_id in (
        select workspace_id from members
        where user_id = auth.uid()
        and role in ('owner', 'admin')
    ));

create policy "Workspace owners and admins can delete invitations"
    on public.workspace_invitations for delete
    using (workspace_id in (
        select workspace_id from members
        where user_id = auth.uid()
        and role in ('owner', 'admin')
    ));