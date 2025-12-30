/*
  # Add Insert Policies for Demo

  ## Overview
  Adds public insert policies to allow seeding and demo functionality.

  ## Security
  - Public insert access for all tables (demo purposes only)
*/

CREATE POLICY "Public insert access for artists"
  ON artists FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public insert access for songs"
  ON songs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public insert access for listeners"
  ON listeners FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public insert access for plays"
  ON plays FOR INSERT
  WITH CHECK (true);
