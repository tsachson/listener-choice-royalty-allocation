/*
  # Drop and Recreate Schema

  ## Overview
  Completely drops the old complex schema and recreates with simplified structure.

  ## Changes
  - Drop all existing tables
  - Recreate with simplified schema
*/

DROP TABLE IF EXISTS plays CASCADE;
DROP TABLE IF EXISTS listener_preferences CASCADE;
DROP TABLE IF EXISTS songs CASCADE;
DROP TABLE IF EXISTS listeners CASCADE;
DROP TABLE IF EXISTS artists CASCADE;

DROP FUNCTION IF EXISTS get_artist_play_counts();

CREATE TABLE artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist_id uuid NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  album text DEFAULT '',
  duration_seconds integer DEFAULT 180,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE listeners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  subscription_fee numeric(10,2) DEFAULT 9.99,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE plays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listener_id uuid NOT NULL REFERENCES listeners(id) ON DELETE CASCADE,
  song_id uuid NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  artist_id uuid NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  played_at timestamptz DEFAULT now()
);

CREATE TABLE listener_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listener_id uuid UNIQUE NOT NULL REFERENCES listeners(id) ON DELETE CASCADE,
  priority_artist_ids uuid[] DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_songs_artist_id ON songs(artist_id);
CREATE INDEX idx_plays_listener_id ON plays(listener_id);
CREATE INDEX idx_plays_song_id ON plays(song_id);
CREATE INDEX idx_plays_artist_id ON plays(artist_id);
CREATE INDEX idx_listener_preferences_listener_id ON listener_preferences(listener_id);

ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE listeners ENABLE ROW LEVEL SECURITY;
ALTER TABLE plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE listener_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for artists"
  ON artists FOR SELECT
  USING (true);

CREATE POLICY "Public read access for songs"
  ON songs FOR SELECT
  USING (true);

CREATE POLICY "Public read access for listeners"
  ON listeners FOR SELECT
  USING (true);

CREATE POLICY "Public read access for plays"
  ON plays FOR SELECT
  USING (true);

CREATE POLICY "Public read access for listener_preferences"
  ON listener_preferences FOR SELECT
  USING (true);

CREATE POLICY "Public insert access for listener_preferences"
  ON listener_preferences FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update access for listener_preferences"
  ON listener_preferences FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION get_artist_play_counts()
RETURNS TABLE (
  artist_id uuid,
  artist_name text,
  play_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id as artist_id,
    a.name as artist_name,
    COUNT(p.id) as play_count
  FROM artists a
  LEFT JOIN plays p ON p.artist_id = a.id
  GROUP BY a.id, a.name
  ORDER BY play_count DESC;
END;
$$ LANGUAGE plpgsql;
