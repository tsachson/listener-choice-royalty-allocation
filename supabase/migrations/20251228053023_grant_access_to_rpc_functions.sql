/*
  # Grant public access to RPC functions

  1. Security
    - Grant EXECUTE permission on database functions to public/anon users
    - This allows the frontend to call these functions
    - The functions themselves respect RLS policies on the underlying tables
*/

GRANT EXECUTE ON FUNCTION get_listener_artist_stats(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_artist_play_counts() TO anon, authenticated;
