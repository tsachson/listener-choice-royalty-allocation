/*
  # Music Royalty Calculator System

  ## Overview
  Creates a simple music streaming royalty calculator that demonstrates how
  different distribution models affect artist payouts.

  ## Tables Created

  ### artists
  Stores artist information
  - id (uuid, primary key)
  - name (text, not null)
  - image_url (text)
  - created_at (timestamptz)

  ### songs
  Stores song information
  - id (uuid, primary key)
  - title (text, not null)
  - artist_id (uuid, foreign key to artists)
  - album (text)
  - duration_seconds (integer)
  - created_at (timestamptz)

  ### listeners
  Stores listener accounts with subscription information
  - id (uuid, primary key)
  - username (text, unique, not null)
  - email (text, unique, not null)
  - subscription_fee (numeric, default 9.99)
  - created_at (timestamptz)

  ### plays
  Stores play history (each row is one song play)
  - id (uuid, primary key)
  - listener_id (uuid, foreign key to listeners)
  - song_id (uuid, foreign key to songs)
  - artist_id (uuid, foreign key to artists)
  - played_at (timestamptz)

  ### listener_preferences
  Stores listener-selected priority artists
  - id (uuid, primary key)
  - listener_id (uuid, unique, foreign key to listeners)
  - priority_artist_ids (uuid array)
  - updated_at (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Public read and write access for demo purposes
*/

-- Artists table
CREATE TABLE IF NOT EXISTS artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Songs table
CREATE TABLE IF NOT EXISTS songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist_id uuid NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  album text DEFAULT '',
  duration_seconds integer DEFAULT 180,
  created_at timestamptz DEFAULT now()
);

-- Listeners table
CREATE TABLE IF NOT EXISTS listeners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  subscription_fee numeric(10,2) DEFAULT 9.99,
  created_at timestamptz DEFAULT now()
);

-- Plays table (play history)
CREATE TABLE IF NOT EXISTS plays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listener_id uuid NOT NULL REFERENCES listeners(id) ON DELETE CASCADE,
  song_id uuid NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  artist_id uuid NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  played_at timestamptz DEFAULT now()
);

-- Listener preferences table
CREATE TABLE IF NOT EXISTS listener_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listener_id uuid UNIQUE NOT NULL REFERENCES listeners(id) ON DELETE CASCADE,
  priority_artist_ids uuid[] DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_songs_artist_id ON songs(artist_id);
CREATE INDEX IF NOT EXISTS idx_plays_listener_id ON plays(listener_id);
CREATE INDEX IF NOT EXISTS idx_plays_song_id ON plays(song_id);
CREATE INDEX IF NOT EXISTS idx_plays_artist_id ON plays(artist_id);
CREATE INDEX IF NOT EXISTS idx_listener_preferences_listener_id ON listener_preferences(listener_id);

-- Enable RLS
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE listeners ENABLE ROW LEVEL SECURITY;
ALTER TABLE plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE listener_preferences ENABLE ROW LEVEL SECURITY;

-- Public read policies for demo
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

-- Public write policies for demo
CREATE POLICY "Public insert access for listener_preferences"
  ON listener_preferences FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update access for listener_preferences"
  ON listener_preferences FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Helper function to get total plays per artist across platform
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
