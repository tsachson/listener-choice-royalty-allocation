/*
  # Add Song Characteristics for Royalty Allocation

  ## Overview
  Adds characteristics to songs for priority allocation based on attributes
  like genre, release year, vocalist gender, themes, geography, instruments, etc.

  ## New Columns
  - `songs` table:
    - `genre` (text) - Musical genre (Rock, Pop, Jazz, Hip-Hop, etc.)
    - `release_year` (integer) - Year the song was released
    - `vocalist_gender` (text) - Gender of primary vocalist (Male, Female, Mixed, Instrumental)
    - `geography` (text) - Geographic origin (US, UK, Canada, Global, etc.)
    - `lead_instrument` (text) - Primary instrument (Guitar, Piano, Synth, Drums, etc.)
    - `theme` (text) - Song theme (Love, Party, Introspective, Political, etc.)

  ## Security
  - No RLS changes needed - uses existing policies
*/

-- Add characteristic columns to songs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'songs' AND column_name = 'genre'
  ) THEN
    ALTER TABLE songs ADD COLUMN genre text DEFAULT 'Pop';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'songs' AND column_name = 'release_year'
  ) THEN
    ALTER TABLE songs ADD COLUMN release_year integer DEFAULT 2020;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'songs' AND column_name = 'vocalist_gender'
  ) THEN
    ALTER TABLE songs ADD COLUMN vocalist_gender text DEFAULT 'Mixed';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'songs' AND column_name = 'geography'
  ) THEN
    ALTER TABLE songs ADD COLUMN geography text DEFAULT 'US';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'songs' AND column_name = 'lead_instrument'
  ) THEN
    ALTER TABLE songs ADD COLUMN lead_instrument text DEFAULT 'Guitar';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'songs' AND column_name = 'theme'
  ) THEN
    ALTER TABLE songs ADD COLUMN theme text DEFAULT 'Love';
  END IF;
END $$;