-- Create function to execute dynamic SQL queries with JSON result
CREATE OR REPLACE FUNCTION exec_query(query text)
RETURNS TABLE (result json)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY EXECUTE format('SELECT row_to_json(t) FROM (%s) t', query);
END;
$$;

-- Create function to execute dynamic SQL queries (for DDL operations)
CREATE OR REPLACE FUNCTION exec(query text)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    EXECUTE query;
END;
$$;

-- Grant execute permissions to service role
GRANT EXECUTE ON FUNCTION exec_query(text) TO service_role;
GRANT EXECUTE ON FUNCTION exec(text) TO service_role;
