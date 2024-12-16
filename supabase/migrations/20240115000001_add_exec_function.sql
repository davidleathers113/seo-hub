-- Create exec function for running SQL statements
create or replace function exec(query text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  execute query;
end;
$$;
