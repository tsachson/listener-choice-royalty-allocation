/*
  # Optimize listener stats function with cached data

  1. Changes
    - Use pre-computed artist_play_counts table instead of scanning all plays
    - Much faster query execution
    - No more statement timeouts
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
  )
  SELECT 
    lap.artist_id,
    lap.artist_name,
    lap.listener_plays,
    COALESCE(apc.total_plays, 0) as total_platform_plays,
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
  LEFT JOIN artist_play_counts apc ON lap.artist_id = apc.artist_id
  ORDER BY lap.listener_plays DESC;
$$;
