/*
  # Create Royalty System Schema

  ## Overview
  This migration extends the music streaming platform with a comprehensive
  royalty calculation system supporting 5 different payout models.

  ## New Tables
  
  ### `listeners`
  Stores user accounts with subscription information
  - `id` (uuid, primary key) - Unique identifier
  - `username` (text, unique) - Display name
  - `email` (text, unique) - Email address
  - `subscription_fee` (numeric) - Monthly subscription fee in USD
  - `created_at` (timestamptz) - Account creation date

  ### `artists`
  Stores artist information with characteristics
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Artist name
  - `bio` (text) - Artist biography
  - `image_url` (text) - Artist image
  - `genres` (text[]) - Array of genres
  - `origin_country` (text) - Geographic origin
  - `active_since` (integer) - Year started
  - `created_at` (timestamptz) - Record creation

  ### `songs`
  Stores song information with detailed characteristics
  - `id` (uuid, primary key) - Unique identifier
  - `title` (text) - Song title
  - `artist_id` (uuid, foreign key) - References artists
  - `album` (text) - Album name
  - `duration` (integer) - Duration in seconds
  - `cover_url` (text) - Album cover image
  - `release_year` (integer) - Year of release
  - `genre` (text) - Primary genre
  - `subgenres` (text[]) - Additional genre tags
  - `era` (text) - Musical era (e.g., '80s, '90s, '00s, '10s, '20s)
  - `geography` (text) - Geographic influence
  - `instrumentation` (text[]) - Instruments featured
  - `themes` (text[]) - Lyrical/emotional themes
  - `mood` (text) - Overall mood
  - `language` (text) - Lyrical language
  - `created_at` (timestamptz) - Record creation

  ### `plays`
  Stores individual play events (listening history)
  - `id` (uuid, primary key) - Unique identifier
  - `listener_id` (uuid, foreign key) - References listeners
  - `song_id` (uuid, foreign key) - References songs
  - `artist_id` (uuid, foreign key) - References artists
  - `played_at` (timestamptz) - When the song was played
  - `play_duration` (integer) - How long it was played (seconds)
  - `completed` (boolean) - Whether play was completed

  ### `listener_preferences`
  Stores each listener's royalty model preferences
  - `id` (uuid, primary key) - Unique identifier
  - `listener_id` (uuid, foreign key, unique) - References listeners
  - `royalty_model` (text) - Selected model: pooled, user_centric, hybrid, priority_artists, priority_characteristics
  - `hybrid_split_user_centric` (numeric) - For hybrid: % going to user-centric (0.0-1.0)
  - `hybrid_split_pooled` (numeric) - For hybrid: % going to pooled (0.0-1.0)
  - `remainder_model` (text) - For priority models: pooled, user_centric, or hybrid
  - `remainder_hybrid_split_uc` (numeric) - For remainder hybrid split
  - `remainder_hybrid_split_pooled` (numeric) - For remainder hybrid split
  - `priority_artist_ids` (uuid[]) - Array of priority artist IDs
  - `priority_genres` (text[]) - Priority genres
  - `priority_eras` (text[]) - Priority eras
  - `priority_geographies` (text[]) - Priority geographies
  - `priority_instrumentations` (text[]) - Priority instrumentations
  - `priority_themes` (text[]) - Priority themes
  - `updated_at` (timestamptz) - Last preference update

  ## Modifications to Existing Tables
  
  ### Drop old tables (we'll recreate with new schema)
  - Drop `playlist_tracks`, `playlists`, `tracks` tables

  ## Security
  - Enable RLS on all tables
  - Public read access for demo purposes

  ## Indexes
  - Performance indexes on foreign keys and frequently queried columns
  - Special indexes for array columns used in characteristic matching

  ## Notes
  - Designed to handle ~2M play records efficiently
  - Characteristics support flexible priority cohort definitions
  - Splits stored as decimals (0.0 to 1.0) for precision
*/

-- Drop old tables to recreate with new schema
DROP TABLE IF EXISTS playlist_tracks CASCADE;
DROP TABLE IF EXISTS playlists CASCADE;
DROP TABLE IF EXISTS tracks CASCADE;

-- Create artists table
CREATE TABLE IF NOT EXISTS artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  bio text DEFAULT '',
  image_url text NOT NULL,
  genres text[] DEFAULT '{}',
  origin_country text NOT NULL,
  active_since integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create songs table
CREATE TABLE IF NOT EXISTS songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist_id uuid NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  album text NOT NULL,
  duration integer NOT NULL,
  cover_url text NOT NULL,
  release_year integer NOT NULL,
  genre text NOT NULL,
  subgenres text[] DEFAULT '{}',
  era text NOT NULL,
  geography text NOT NULL,
  instrumentation text[] DEFAULT '{}',
  themes text[] DEFAULT '{}',
  mood text NOT NULL,
  language text DEFAULT 'English',
  created_at timestamptz DEFAULT now()
);

-- Create listeners table
CREATE TABLE IF NOT EXISTS listeners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  subscription_fee numeric(10,2) DEFAULT 9.99,
  created_at timestamptz DEFAULT now()
);

-- Create plays table
CREATE TABLE IF NOT EXISTS plays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listener_id uuid NOT NULL REFERENCES listeners(id) ON DELETE CASCADE,
  song_id uuid NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  artist_id uuid NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  played_at timestamptz NOT NULL DEFAULT now(),
  play_duration integer NOT NULL,
  completed boolean DEFAULT true
);

-- Create listener_preferences table
CREATE TABLE IF NOT EXISTS listener_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listener_id uuid UNIQUE NOT NULL REFERENCES listeners(id) ON DELETE CASCADE,
  royalty_model text NOT NULL DEFAULT 'pooled',
  hybrid_split_user_centric numeric(3,2) DEFAULT 0.50,
  hybrid_split_pooled numeric(3,2) DEFAULT 0.50,
  remainder_model text,
  remainder_hybrid_split_uc numeric(3,2),
  remainder_hybrid_split_pooled numeric(3,2),
  priority_artist_ids uuid[] DEFAULT '{}',
  priority_genres text[] DEFAULT '{}',
  priority_eras text[] DEFAULT '{}',
  priority_geographies text[] DEFAULT '{}',
  priority_instrumentations text[] DEFAULT '{}',
  priority_themes text[] DEFAULT '{}',
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_royalty_model CHECK (royalty_model IN ('pooled', 'user_centric', 'hybrid', 'priority_artists', 'priority_characteristics')),
  CONSTRAINT valid_remainder_model CHECK (remainder_model IS NULL OR remainder_model IN ('pooled', 'user_centric', 'hybrid'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_songs_artist_id ON songs(artist_id);
CREATE INDEX IF NOT EXISTS idx_songs_genre ON songs(genre);
CREATE INDEX IF NOT EXISTS idx_songs_era ON songs(era);
CREATE INDEX IF NOT EXISTS idx_plays_listener_id ON plays(listener_id);
CREATE INDEX IF NOT EXISTS idx_plays_song_id ON plays(song_id);
CREATE INDEX IF NOT EXISTS idx_plays_artist_id ON plays(artist_id);
CREATE INDEX IF NOT EXISTS idx_plays_played_at ON plays(played_at);
CREATE INDEX IF NOT EXISTS idx_listener_preferences_listener_id ON listener_preferences(listener_id);

-- Create GIN indexes for array columns (for efficient array operations)
CREATE INDEX IF NOT EXISTS idx_artists_genres_gin ON artists USING GIN(genres);
CREATE INDEX IF NOT EXISTS idx_songs_subgenres_gin ON songs USING GIN(subgenres);
CREATE INDEX IF NOT EXISTS idx_songs_instrumentation_gin ON songs USING GIN(instrumentation);
CREATE INDEX IF NOT EXISTS idx_songs_themes_gin ON songs USING GIN(themes);

-- Enable Row Level Security
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE listeners ENABLE ROW LEVEL SECURITY;
ALTER TABLE plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE listener_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (demo purposes)
CREATE POLICY "Anyone can view artists"
  ON artists FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view songs"
  ON songs FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view listeners"
  ON listeners FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view plays"
  ON plays FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view listener preferences"
  ON listener_preferences FOR SELECT
  USING (true);