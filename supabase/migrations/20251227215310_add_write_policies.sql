/*
  # Add Write Policies for Demo

  ## Changes
  - Add INSERT, UPDATE, DELETE policies for all tables
  - Allow anyone to modify data (demo purposes only)

  ## Security Note
  - This is for demo purposes only
  - In production, these policies would be properly restricted
*/

-- Artists policies
CREATE POLICY "Anyone can insert artists"
  ON artists FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update artists"
  ON artists FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete artists"
  ON artists FOR DELETE
  USING (true);

-- Songs policies
CREATE POLICY "Anyone can insert songs"
  ON songs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update songs"
  ON songs FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete songs"
  ON songs FOR DELETE
  USING (true);

-- Listeners policies
CREATE POLICY "Anyone can insert listeners"
  ON listeners FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update listeners"
  ON listeners FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete listeners"
  ON listeners FOR DELETE
  USING (true);

-- Plays policies
CREATE POLICY "Anyone can insert plays"
  ON plays FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update plays"
  ON plays FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete plays"
  ON plays FOR DELETE
  USING (true);

-- Listener preferences policies
CREATE POLICY "Anyone can insert listener preferences"
  ON listener_preferences FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update listener preferences"
  ON listener_preferences FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete listener preferences"
  ON listener_preferences FOR DELETE
  USING (true);