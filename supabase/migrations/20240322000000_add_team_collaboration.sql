-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Drop existing policies if they exist
drop policy if exists "Users can view their workspace groups" on public.team_groups;
drop policy if exists "Workspace owners and admins can manage groups" on public.team_groups;
drop policy if exists "Users can view discussions in their groups" on public.team_discussions;
drop policy if exists "Users can manage their own discussions" on public.team_discussions;
drop policy if exists "Users can view and create task comments" on public.task_comments;
drop policy if exists "Users can manage documents in their groups" on public.team_documents;

-- Create team groups table
create table if not exists public.team_groups (
    id uuid default uuid_generate_v4() primary key,
    workspace_id uuid references public.workspaces(id) on delete cascade,
    name text not null,
    description text,
    created_by uuid references auth.users(id),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create team group members table
create table if not exists public.team_group_members (
    id uuid default uuid_generate_v4() primary key,
    group_id uuid references public.team_groups(id) on delete cascade,
    member_id uuid references public.members(id) on delete cascade,
    created_at timestamptz default now(),
    unique(group_id, member_id)
);

-- Create team discussions table
create table if not exists public.team_discussions (
    id uuid default uuid_generate_v4() primary key,
    workspace_id uuid references public.workspaces(id) on delete cascade,
    title text not null,
    content text not null,
    created_by uuid references auth.users(id),
    group_id uuid references public.team_groups(id),
    is_pinned boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create discussion comments table
create table if not exists public.discussion_comments (
    id uuid default uuid_generate_v4() primary key,
    discussion_id uuid references public.team_discussions(id) on delete cascade,
    content text not null,
    created_by uuid references auth.users(id),
    parent_id uuid references public.discussion_comments(id),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create team tasks table
create table if not exists public.team_tasks (
    id uuid default uuid_generate_v4() primary key,
    workspace_id uuid references public.workspaces(id) on delete cascade,
    title text not null,
    description text,
    status text default 'todo' check (status in ('todo', 'in_progress', 'review', 'done')),
    priority text default 'medium' check (priority in ('low', 'medium', 'high')),
    due_date timestamptz,
    assigned_to uuid references auth.users(id),
    group_id uuid references public.team_groups(id),
    created_by uuid references auth.users(id),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create task comments table
create table if not exists public.task_comments (
    id uuid default uuid_generate_v4() primary key,
    task_id uuid references public.team_tasks(id) on delete cascade,
    content text not null,
    created_by uuid references auth.users(id),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create team documents table
create table if not exists public.team_documents (
    id uuid default uuid_generate_v4() primary key,
    workspace_id uuid references public.workspaces(id) on delete cascade,
    title text not null,
    content text not null,
    group_id uuid references public.team_groups(id),
    created_by uuid references auth.users(id),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS
alter table public.team_groups enable row level security;
alter table public.team_group_members enable row level security;
alter table public.team_discussions enable row level security;
alter table public.discussion_comments enable row level security;
alter table public.team_tasks enable row level security;
alter table public.task_comments enable row level security;
alter table public.team_documents enable row level security;

-- Create policies
create policy "Users can view their workspace groups"
    on public.team_groups for select
    using (auth.uid() in (
        select m.user_id from public.members m
        where m.workspace_id = team_groups.workspace_id
    ));

create policy "Workspace owners and admins can manage groups"
    on public.team_groups for all
    using (auth.uid() in (
        select m.user_id from public.members m
        where m.workspace_id = team_groups.workspace_id
        and m.role in ('owner', 'admin')
    ));

create policy "Users can view discussions in their groups"
    on public.team_discussions for select
    using (auth.uid() in (
        select m.user_id from public.members m
        where m.workspace_id = team_discussions.workspace_id
    ));

create policy "Users can manage their own discussions"
    on public.team_discussions for all
    using (auth.uid() = created_by);

-- Create function for updated_at trigger
create or replace function public.handle_team_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_team_updated_at
    before update on public.team_groups
    for each row
    execute function public.handle_team_updated_at();

create trigger handle_team_updated_at
    before update on public.team_discussions
    for each row
    execute function public.handle_team_updated_at();

create trigger handle_team_updated_at
    before update on public.discussion_comments
    for each row
    execute function public.handle_team_updated_at();

create trigger handle_team_updated_at
    before update on public.team_tasks
    for each row
    execute function public.handle_team_updated_at();

create trigger handle_team_updated_at
    before update on public.team_documents
    for each row
    execute function public.handle_team_updated_at();