-- Create tables for content management
create table if not exists public.niches (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.pillars (
  id uuid default gen_random_uuid() primary key,
  niche_id uuid references public.niches(id) on delete cascade,
  title text not null,
  description text,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.articles (
  id uuid default gen_random_uuid() primary key,
  pillar_id uuid references public.pillars(id) on delete cascade,
  title text not null,
  content text,
  status text default 'draft' check (status in ('draft', 'review', 'published')),
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  published_at timestamp with time zone
);

create table if not exists public.outlines (
  id uuid default gen_random_uuid() primary key,
  article_id uuid references public.articles(id) on delete cascade,
  content jsonb not null default '{}',
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.niches enable row level security;
alter table public.pillars enable row level security;
alter table public.articles enable row level security;
alter table public.outlines enable row level security;

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

-- Create functions for updated_at trigger
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

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