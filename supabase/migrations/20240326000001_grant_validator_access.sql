-- Grant access to system tables needed for validation
GRANT SELECT ON pg_catalog.pg_policies TO service_role;
GRANT SELECT ON information_schema.columns TO service_role;
GRANT SELECT ON pg_catalog.pg_indexes TO service_role;
GRANT SELECT ON information_schema.table_constraints TO service_role;
GRANT SELECT ON information_schema.key_column_usage TO service_role;
GRANT SELECT ON information_schema.tables TO service_role;

-- Additional system catalog tables that might be needed
GRANT SELECT ON pg_catalog.pg_class TO service_role;
GRANT SELECT ON pg_catalog.pg_namespace TO service_role;
GRANT SELECT ON pg_catalog.pg_attribute TO service_role;
GRANT SELECT ON pg_catalog.pg_constraint TO service_role;
