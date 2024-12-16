-- Enable Storage by creating an empty storage schema
create schema if not exists storage;

-- Set up Storage RLS
create policy "Users can view their own files"
on storage.objects
for select
using (
  auth.uid() = owner
);

create policy "Users can upload files"
on storage.objects
for insert
with check (
  auth.uid() = owner AND
  (bucket_id = 'content-creation-app') AND
  (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update their own files"
on storage.objects
for update
using (
  auth.uid() = owner
)
with check (
  auth.uid() = owner AND
  (bucket_id = 'content-creation-app') AND
  (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete their own files"
on storage.objects
for delete
using (
  auth.uid() = owner AND
  (bucket_id = 'content-creation-app') AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create a function to handle file path organization
create or replace function storage.foldername(name text)
returns text[]
language plpgsql
as $$
begin
  return string_to_array(name, '/');
end;
$$;

-- Create a trigger to automatically set the owner on insert
create or replace function storage.set_file_owner()
returns trigger
language plpgsql
as $$
begin
  new.owner = auth.uid();
  return new;
end;
$$;

create trigger set_file_owner
  before insert on storage.objects
  for each row
  execute function storage.set_file_owner();

-- Add owner column if it doesn't exist
do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'storage'
    and table_name = 'objects'
    and column_name = 'owner'
  ) then
    alter table storage.objects
    add column owner uuid references auth.users(id);
  end if;
end $$;

-- Update existing files to have the current user as owner (if needed)
update storage.objects
set owner = auth.uid()
where owner is null;