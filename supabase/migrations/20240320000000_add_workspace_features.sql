-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Create tables if they don't exist
create table if not exists public.workspaces (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    slug text unique not null,
    owner_id uuid references auth.users(id) on delete cascade,
    logo_url text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table if not exists public.members (
    id uuid default uuid_generate_v4() primary key,
    workspace_id uuid references public.workspaces(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    role text default 'member' check (role in ('owner', 'admin', 'member')),
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(workspace_id, user_id)
);

create table if not exists public.domains (
    id uuid default uuid_generate_v4() primary key,
    workspace_id uuid references public.workspaces(id) on delete cascade,
    domain text unique not null,
    status text default 'pending' check (status in ('pending', 'active', 'invalid')),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table if not exists public.subscription_plans (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    description text,
    price decimal(10,2) not null,
    features jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table if not exists public.subscriptions (
    id uuid default uuid_generate_v4() primary key,
    workspace_id uuid references public.workspaces(id) on delete cascade,
    plan_id uuid references public.subscription_plans(id),
    status text default 'active' check (status in ('active', 'cancelled', 'expired')),
    current_period_start timestamptz,
    current_period_end timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create indexes if they don't exist
create index if not exists idx_workspaces_owner on public.workspaces(owner_id);
create index if not exists idx_members_workspace on public.members(workspace_id);
create index if not exists idx_members_user on public.members(user_id);
create index if not exists idx_domains_workspace on public.domains(workspace_id);
create index if not exists idx_subscriptions_workspace on public.subscriptions(workspace_id);
create index if not exists idx_subscriptions_plan on public.subscriptions(plan_id);

-- Enable RLS
alter table public.workspaces enable row level security;
alter table public.members enable row level security;
alter table public.domains enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.subscriptions enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view their own workspaces" on public.workspaces;
drop policy if exists "Users can create workspaces" on public.workspaces;
drop policy if exists "Users can update their own workspaces" on public.workspaces;
drop policy if exists "Users can delete their own workspaces" on public.workspaces;

-- Create policies
create policy "Users can view their own workspaces"
    on public.workspaces for select
    using (auth.uid() in (
        select user_id from public.members where workspace_id = workspaces.id
        union
        select owner_id from public.workspaces where owner_id = auth.uid()
    ));

create policy "Users can create workspaces"
    on public.workspaces for insert
    with check (auth.uid() = owner_id);

create policy "Users can update their own workspaces"
    on public.workspaces for update
    using (auth.uid() = owner_id);

create policy "Users can delete their own workspaces"
    on public.workspaces for delete
    using (auth.uid() = owner_id);

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
    before update on public.domains
    for each row
    execute function public.handle_workspace_updated_at();

create trigger handle_workspace_updated_at
    before update on public.subscription_plans
    for each row
    execute function public.handle_workspace_updated_at();

create trigger handle_workspace_updated_at
    before update on public.subscriptions
    for each row
    execute function public.handle_workspace_updated_at();
