-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Create workspaces table
create table if not exists public.workspaces (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    slug text unique not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create members table
create table if not exists public.members (
    id uuid default uuid_generate_v4() primary key,
    workspace_id uuid references public.workspaces(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    role text not null check (role in ('owner', 'admin', 'member')),
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(workspace_id, user_id)
);

-- Create workspace invitations table
create table if not exists public.workspace_invitations (
    id uuid default uuid_generate_v4() primary key,
    workspace_id uuid references public.workspaces(id) on delete cascade,
    email text not null,
    role text not null check (role in ('admin', 'member')),
    token text not null unique,
    expires_at timestamptz not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS
alter table public.workspaces enable row level security;
alter table public.members enable row level security;
alter table public.workspace_invitations enable row level security;

-- Create policies for workspaces
create policy "Users can view workspaces they are members of"
    on public.workspaces for select
    using (auth.uid() in (
        select user_id from public.members
        where workspace_id = id
    ));

create policy "Workspace owners can manage workspace"
    on public.workspaces for all
    using (auth.uid() in (
        select user_id from public.members
        where workspace_id = id
        and role = 'owner'
    ));

-- Create policies for members
create policy "Users can view members in their workspaces"
    on public.members for select
    using (auth.uid() in (
        select user_id from public.members m2
        where m2.workspace_id = workspace_id
    ));

create policy "Workspace owners and admins can manage members"
    on public.members for all
    using (auth.uid() in (
        select user_id from public.members m2
        where m2.workspace_id = workspace_id
        and m2.role in ('owner', 'admin')
    ));

-- Create policies for workspace invitations
create policy "Users can view invitations for their workspaces"
    on public.workspace_invitations for select
    using (auth.uid() in (
        select user_id from public.members
        where workspace_id = workspace_invitations.workspace_id
    ));

create policy "Workspace owners and admins can manage invitations"
    on public.workspace_invitations for all
    using (auth.uid() in (
        select user_id from public.members
        where workspace_id = workspace_invitations.workspace_id
        and role in ('owner', 'admin')
    ));

-- Create function for updated_at trigger
create or replace function public.handle_workspace_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_workspace_updated_at
    before update on public.workspaces
    for each row
    execute function public.handle_workspace_updated_at();

create trigger handle_workspace_updated_at
    before update on public.members
    for each row
    execute function public.handle_workspace_updated_at();

create trigger handle_workspace_updated_at
    before update on public.workspace_invitations
    for each row
    execute function public.handle_workspace_updated_at();