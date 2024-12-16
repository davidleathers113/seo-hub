-- Create functions to safely query information schema
create or replace function admin_get_table_constraints()
returns table (
    table_name text,
    constraint_name text,
    constraint_type text
)
security definer
set search_path = public
language sql
as $$
    select 
        table_name::text,
        constraint_name::text,
        constraint_type::text
    from information_schema.table_constraints
    where table_schema = 'public';
$$;

-- Grant execute permission to authenticated users
grant execute on function admin_get_table_constraints to authenticated;

-- Create function to get foreign key information
create or replace function admin_get_foreign_keys()
returns table (
    constraint_name text,
    table_name text,
    referenced_table_name text,
    referenced_column_name text
)
security definer
set search_path = public
language sql
as $$
    select 
        kcu.constraint_name::text,
        kcu.table_name::text,
        ccu.table_name::text as referenced_table_name,
        ccu.column_name::text as referenced_column_name
    from information_schema.key_column_usage kcu
    join information_schema.referential_constraints rc 
        on kcu.constraint_name = rc.constraint_name
    join information_schema.constraint_column_usage ccu 
        on rc.unique_constraint_name = ccu.constraint_name
    where kcu.table_schema = 'public';
$$;

-- Grant execute permission to authenticated users
grant execute on function admin_get_foreign_keys to authenticated;
