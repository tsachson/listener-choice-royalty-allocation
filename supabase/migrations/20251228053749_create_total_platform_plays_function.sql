/*
  # Create function to get total platform plays efficiently

  1. New Function
    - `get_total_platform_plays()` - Returns the total count of plays from all listeners
    - Uses aggregated count instead of trying to return all rows
    
  2. Purpose
    - Avoid REST API timeout when querying large plays table
    - Provide efficient count endpoint
*/

CREATE OR REPLACE FUNCTION get_total_platform_plays()
RETURNS bigint
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::bigint FROM plays;
$$;

GRANT EXECUTE ON FUNCTION get_total_platform_plays() TO public;
