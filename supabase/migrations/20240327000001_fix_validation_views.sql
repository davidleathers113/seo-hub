CREATE OR REPLACE VIEW public.validation_policies AS
SELECT
  pol.polname as policy_name,
  cls.relname as table_name,
  CASE pol.polcmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    ELSE pol.polcmd::text
  END as action_name,
  pol.polqual::text as definition,
  ARRAY(
    SELECT rolname::text
    FROM pg_roles
    WHERE oid = ANY(pol.polroles)
  ) as roles
FROM pg_policy pol
JOIN pg_class cls ON pol.polrelid = cls.oid
WHERE cls.relnamespace = 'public'::regnamespace;

GRANT SELECT ON public.validation_policies TO validator_role;