/*
  # Add composite indexes for query performance

  1. New Indexes
    - Composite index on plays(listener_id, artist_id) for efficient grouping
    - Composite index on plays(listener_id, song_id) for efficient song lookups
  
  2. Purpose
    - Speed up aggregation queries that group by listener_id and artist_id
    - Improve query performance for listener-specific data fetching
*/

CREATE INDEX IF NOT EXISTS idx_plays_listener_artist ON plays(listener_id, artist_id);
CREATE INDEX IF NOT EXISTS idx_plays_listener_song ON plays(listener_id, song_id);
