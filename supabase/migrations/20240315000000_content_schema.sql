-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Create tables for content management
create table if not exists public.niches (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.pillars (
  id uuid default uuid_generate_v4() primary key,
  niche_id uuid references public.niches(id) on delete cascade,
  title text not null,
  description text,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.articles (
  id uuid default uuid_generate_v4() primary key,
  pillar_id uuid references public.pillars(id) on delete cascade,
  title text not null,
  content text,
  status text default 'draft' check (status in ('draft', 'review', 'published')),
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  published_at timestamptz
);

create table if not exists public.outlines (
  id uuid default uuid_generate_v4() primary key,
  article_id uuid references public.articles(id) on delete cascade,
  content jsonb not null default '{}',
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Set up Row Level Security (RLS)
alter table public.niches enable row level security;
alter table public.pillars enable row level security;
alter table public.articles enable row level security;
alter table public.outlines enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view their own niches" on public.niches;
drop policy if exists "Users can insert their own niches" on public.niches;
drop policy if exists "Users can update their own niches" on public.niches;
drop policy if exists "Users can delete their own niches" on public.niches;

drop policy if exists "Users can view their own pillars" on public.pillars;
drop policy if exists "Users can insert their own pillars" on public.pillars;
drop policy if exists "Users can update their own pillars" on public.pillars;
drop policy if exists "Users can delete their own pillars" on public.pillars;

drop policy if exists "Users can view their own articles" on public.articles;
drop policy if exists "Users can insert their own articles" on public.articles;
drop policy if exists "Users can update their own articles" on public.articles;
drop policy if exists "Users can delete their own articles" on public.articles;

drop policy if exists "Users can view their own outlines" on public.outlines;
drop policy if exists "Users can insert their own outlines" on public.outlines;
drop policy if exists "Users can update their own outlines" on public.outlines;
drop policy if exists "Users can delete their own outlines" on public.outlines;

-- Create policies
create policy "Users can view their own niches"
  on public.niches for select
  using (auth.uid() = user_id);

create policy "Users can insert their own niches"
  on public.niches for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own niches"
  on public.niches for update
  using (auth.uid() = user_id);

create policy "Users can delete their own niches"
  on public.niches for delete
  using (auth.uid() = user_id);

-- Repeat for pillars
create policy "Users can view their own pillars"
  on public.pillars for select
  using (auth.uid() = user_id);

create policy "Users can insert their own pillars"
  on public.pillars for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own pillars"
  on public.pillars for update
  using (auth.uid() = user_id);

create policy "Users can delete their own pillars"
  on public.pillars for delete
  using (auth.uid() = user_id);

-- Repeat for articles
create policy "Users can view their own articles"
  on public.articles for select
  using (auth.uid() = user_id);

create policy "Users can insert their own articles"
  on public.articles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own articles"
  on public.articles for update
  using (auth.uid() = user_id);

create policy "Users can delete their own articles"
  on public.articles for delete
  using (auth.uid() = user_id);

-- Repeat for outlines
create policy "Users can view their own outlines"
  on public.outlines for select
  using (auth.uid() = user_id);

create policy "Users can insert their own outlines"
  on public.outlines for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own outlines"
  on public.outlines for update
  using (auth.uid() = user_id);

create policy "Users can delete their own outlines"
  on public.outlines for delete
  using (auth.uid() = user_id);

-- Create function for updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_updated_at
  before update on public.niches
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.pillars
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.articles
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.outlines
  for each row
  execute function public.handle_updated_at();