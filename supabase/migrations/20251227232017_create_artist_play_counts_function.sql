/*
  # Create function to get artist play counts
  
  1. New Function
    - `get_artist_play_counts()` - Returns aggregated play counts per artist
    - Much more efficient than loading millions of individual play records
    - Returns artist_id, artist_name, and play_count for each artist
  
  2. Purpose
    - Enables efficient calculation of platform-wide statistics
    - Avoids hitting Supabase's row limit when querying millions of plays
*/

CREATE OR REPLACE FUNCTION get_artist_play_counts()
RETURNS TABLE (
  artist_id uuid,
  artist_name text,
  play_count bigint
) 
LANGUAGE sql
STABLE
AS $$
  SELECT 
    p.artist_id,
    a.name as artist_name,
    COUNT(*) as play_count
  FROM plays p
  INNER JOIN artists a ON p.artist_id = a.id
  GROUP BY p.artist_id, a.name
  ORDER BY play_count DESC;
$$;