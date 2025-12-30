/*
  # Create efficient listener artist stats function

  1. New Function
    - `get_listener_artist_stats(p_listener_id uuid)` - Returns aggregated play data for a specific listener
    - Returns artist_id, artist_name, listener_plays, total_platform_plays, and songs array
    - Much more efficient than loading individual play records in the frontend
  
  2. Purpose
    - Avoids the 500 error caused by loading 7000+ play records with nested joins
    - Performs aggregation in the database which is much faster
    - Returns only the data needed for calculations
*/

CREATE OR REPLACE FUNCTION get_listener_artist_stats(p_listener_id uuid)
RETURNS TABLE (
  artist_id uuid,
  artist_name text,
  listener_plays bigint,
  total_platform_plays bigint,
  songs jsonb
) 
LANGUAGE sql
STABLE
AS $$
  WITH listener_artist_plays AS (
    SELECT 
      p.artist_id,
      a.name as artist_name,
      COUNT(*) as listener_plays,
      array_agg(DISTINCT p.song_id) as song_ids
    FROM plays p
    INNER JOIN artists a ON p.artist_id = a.id
    WHERE p.listener_id = p_listener_id
    GROUP BY p.artist_id, a.name
  ),
  platform_artist_plays AS (
    SELECT 
      artist_id,
      COUNT(*) as total_plays
    FROM plays
    GROUP BY artist_id
  )
  SELECT 
    lap.artist_id,
    lap.artist_name,
    lap.listener_plays,
    COALESCE(pap.total_plays, 0) as total_platform_plays,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', s.id,
          'title', s.title,
          'genre', s.genre,
          'vocalist_gender', s.vocalist_gender,
          'geography', s.geography,
          'lead_instrument', s.lead_instrument,
          'theme', s.theme
        )
      )
      FROM songs s
      WHERE s.id = ANY(lap.song_ids)
    ) as songs
  FROM listener_artist_plays lap
  LEFT JOIN platform_artist_plays pap ON lap.artist_id = pap.artist_id
  ORDER BY lap.listener_plays DESC;
$$;
