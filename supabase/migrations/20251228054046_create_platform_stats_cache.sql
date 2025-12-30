/*
  # Create cached platform statistics table

  1. New Table
    - `platform_stats` - Single-row cache table for platform-wide statistics
    - Stores total play count to avoid scanning 4.8M rows on every request
    
  2. Purpose
    - Dramatically improve query performance
    - Avoid timeout on large plays table
    
  3. Security
    - Enable RLS with public read access
*/

CREATE TABLE IF NOT EXISTS platform_stats (
  id integer PRIMARY KEY DEFAULT 1,
  total_plays bigint NOT NULL DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  CONSTRAINT single_row_constraint CHECK (id = 1)
);

ALTER TABLE platform_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for platform_stats"
  ON platform_stats FOR SELECT
  TO public
  USING (true);

INSERT INTO platform_stats (id, total_plays, last_updated)
SELECT 1, COUNT(*)::bigint, now()
FROM plays
ON CONFLICT (id) DO UPDATE 
SET total_plays = EXCLUDED.total_plays, last_updated = EXCLUDED.last_updated;

CREATE OR REPLACE FUNCTION get_total_platform_plays()
RETURNS bigint
LANGUAGE sql
STABLE
AS $$
  SELECT total_plays FROM platform_stats WHERE id = 1;
$$;

GRANT EXECUTE ON FUNCTION get_total_platform_plays() TO public;
