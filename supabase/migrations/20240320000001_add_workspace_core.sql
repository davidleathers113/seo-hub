-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_graphql";

-- Create workspaces table
create table if not exists public.workspaces (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    slug text unique not null,
    created_at timestamptz default timezone('utc'::text, now()),
    updated_at timestamptz default timezone('utc'::text, now())
);

-- Create indexes for workspaces
create index if not exists workspaces_slug_idx on public.workspaces (slug);

-- Create members table
create table if not exists public.members (
    id uuid default uuid_generate_v4() primary key,
    workspace_id uuid references public.workspaces(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    role text not null check (role in ('owner', 'admin', 'member')),
    created_at timestamptz default timezone('utc'::text, now()),
    updated_at timestamptz default timezone('utc'::text, now()),
    unique(workspace_id, user_id)
);

-- Create indexes for members
create index if not exists members_workspace_id_idx on public.members (workspace_id);
create index if not exists members_user_id_idx on public.members (user_id);

-- Create workspace invitations table
create table if not exists public.workspace_invitations (
    id uuid default uuid_generate_v4() primary key,
    workspace_id uuid references public.workspaces(id) on delete cascade,
    email text not null,
    role text not null check (role in ('admin', 'member')),
    token text not null unique,
    expires_at timestamptz not null,
    created_at timestamptz default timezone('utc'::text, now()),
    updated_at timestamptz default timezone('utc'::text, now())
);

-- Create indexes for invitations
create index if not exists workspace_invitations_workspace_id_idx on public.workspace_invitations (workspace_id);
create index if not exists workspace_invitations_token_idx on public.workspace_invitations (token);
create index if not exists workspace_invitations_email_idx on public.workspace_invitations (email);

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

create policy "Workspace owners can update workspace"
    on public.workspaces for update
    using (auth.uid() in (
        select user_id from public.members
        where workspace_id = id
        and role = 'owner'
    ))
    with check (auth.uid() in (
        select user_id from public.members
        where workspace_id = id
        and role = 'owner'
    ));

create policy "Workspace owners can delete workspace"
    on public.workspaces for delete
    using (auth.uid() in (
        select user_id from public.members
        where workspace_id = id
        and role = 'owner'
    ));

create policy "Authenticated users can create workspaces"
    on public.workspaces for insert
    with check (auth.role() = 'authenticated');

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
    ))
    with check (auth.uid() in (
        select user_id from public.members m2
        where m2.workspace_id = workspace_id
        and m2.role in ('owner', 'admin')
    ));

-- Create function for updated_at trigger
create or replace function public.handle_workspace_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql security definer;

-- Drop existing triggers if they exist
drop trigger if exists handle_workspace_updated_at on public.workspaces;
drop trigger if exists handle_workspace_updated_at on public.members;
drop trigger if exists handle_workspace_updated_at on public.workspace_invitations;

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