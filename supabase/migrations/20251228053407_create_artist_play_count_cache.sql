/*
  # Create cached artist play counts table

  1. New Table
    - `artist_play_counts` - Materialized cache of total platform plays per artist
    - Refreshed periodically instead of calculating on every request
    
  2. Purpose
    - Avoid scanning 4.8M plays on every listener query
    - Dramatically improve query performance
*/

CREATE TABLE IF NOT EXISTS artist_play_counts (
  artist_id uuid PRIMARY KEY REFERENCES artists(id) ON DELETE CASCADE,
  total_plays bigint NOT NULL DEFAULT 0,
  last_updated timestamptz DEFAULT now()
);

ALTER TABLE artist_play_counts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for artist_play_counts"
  ON artist_play_counts FOR SELECT
  TO public
  USING (true);

CREATE INDEX IF NOT EXISTS idx_artist_play_counts_artist_id ON artist_play_counts(artist_id);

INSERT INTO artist_play_counts (artist_id, total_plays, last_updated)
SELECT 
  artist_id,
  COUNT(*) as total_plays,
  now()
FROM plays
GROUP BY artist_id
ON CONFLICT (artist_id) DO UPDATE 
SET total_plays = EXCLUDED.total_plays, last_updated = EXCLUDED.last_updated;
