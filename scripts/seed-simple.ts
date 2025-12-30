import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function clearDatabase() {
  console.log('Clearing existing data...');
  await supabase.from('plays').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('songs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('listeners').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('artists').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('Database cleared.');
}

type ArtistTier = {
  name: string;
  platformPlays: number;
  tier: 'Superstar' | 'Popular' | 'Mid-tier' | 'Indie';
};

async function seedTestData() {
  console.log('\nCreating artists with varied popularity...');

  const artistTiers: ArtistTier[] = [
    { name: 'Stellar Nova', platformPlays: 450000000, tier: 'Superstar' },
    { name: 'Luna Rivers', platformPlays: 125000000, tier: 'Popular' },
    { name: 'The Midnight Band', platformPlays: 78000000, tier: 'Popular' },
    { name: 'Sarah Chen', platformPlays: 22000000, tier: 'Mid-tier' },
    { name: 'Marcus Bell', platformPlays: 8500000, tier: 'Mid-tier' },
    { name: 'Emma Stone', platformPlays: 3800000, tier: 'Mid-tier' },
    { name: 'River Phoenix', platformPlays: 450000, tier: 'Indie' },
    { name: 'The Jazz Quartet', platformPlays: 125000, tier: 'Indie' },
    { name: 'Violet Dreams', platformPlays: 45000, tier: 'Indie' },
    { name: 'Acoustic Sam', platformPlays: 12000, tier: 'Indie' },
  ];

  const artistsData = artistTiers.map((a, i) => ({
    name: a.name,
    image_url: `https://i.pravatar.cc/150?img=${i + 1}`,
  }));

  const { data: artists, error: artistsError } = await supabase
    .from('artists')
    .insert(artistsData)
    .select();

  if (artistsError) throw artistsError;
  console.log(`Created ${artists.length} artists.`);

  artistTiers.forEach((tier, idx) => {
    console.log(`  ${tier.name} (${tier.tier}): ${tier.platformPlays.toLocaleString()} platform plays`);
  });

  console.log('\nCreating songs for each artist...');
  const songsData = [
    { title: 'Cosmic Journey', artist_id: artists[0].id, album: 'Infinite', duration_seconds: 312, genre: 'Electronic', release_year: 2024, vocalist_gender: 'Female Vocals', geography: 'US', lead_instrument: 'Synth', theme: 'Introspective' },
    { title: 'Stellar Nights', artist_id: artists[0].id, album: 'Infinite', duration_seconds: 298, genre: 'Electronic', release_year: 2024, vocalist_gender: 'Female Vocals', geography: 'US', lead_instrument: 'Synth', theme: 'Party' },

    { title: 'Moonlight Dreams', artist_id: artists[1].id, album: 'Night Sky', duration_seconds: 245, genre: 'Pop', release_year: 2023, vocalist_gender: 'Female Vocals', geography: 'US', lead_instrument: 'Vocals', theme: 'Love' },
    { title: 'Silver Waves', artist_id: artists[1].id, album: 'Night Sky', duration_seconds: 223, genre: 'Pop', release_year: 2023, vocalist_gender: 'Female Vocals', geography: 'US', lead_instrument: 'Vocals', theme: 'Love' },

    { title: 'Midnight Hour', artist_id: artists[2].id, album: 'After Dark', duration_seconds: 267, genre: 'Rock', release_year: 2021, vocalist_gender: 'Male Vocals', geography: 'US', lead_instrument: 'Guitar', theme: 'Party' },

    { title: 'City Lights', artist_id: artists[3].id, album: 'Urban Tales', duration_seconds: 189, genre: 'Pop', release_year: 2024, vocalist_gender: 'Female Vocals', geography: 'Asia', lead_instrument: 'Piano', theme: 'Urban Life' },

    { title: 'Heart Beat', artist_id: artists[4].id, album: 'Pulse', duration_seconds: 201, genre: 'R&B', release_year: 2023, vocalist_gender: 'Male Vocals', geography: 'US', lead_instrument: 'Vocals', theme: 'Love' },

    { title: 'Ocean Waves', artist_id: artists[5].id, album: 'Coastal', duration_seconds: 198, genre: 'Indie', release_year: 2022, vocalist_gender: 'Female Vocals', geography: 'UK', lead_instrument: 'Guitar', theme: 'Nature' },

    { title: 'River Flow', artist_id: artists[6].id, album: 'Nature Sounds', duration_seconds: 223, genre: 'Folk', release_year: 2023, vocalist_gender: 'Male Vocals', geography: 'Canada', lead_instrument: 'Acoustic Guitar', theme: 'Nature' },

    { title: 'Smooth Jazz', artist_id: artists[7].id, album: 'Evening Sessions', duration_seconds: 278, genre: 'Jazz', release_year: 2020, vocalist_gender: 'Instrumental', geography: 'US', lead_instrument: 'Saxophone', theme: 'Introspective' },

    { title: 'Purple Haze', artist_id: artists[8].id, album: 'Dreams', duration_seconds: 234, genre: 'Alternative', release_year: 2024, vocalist_gender: 'Female Vocals', geography: 'US', lead_instrument: 'Guitar', theme: 'Introspective' },

    { title: 'Lonely Road', artist_id: artists[9].id, album: 'Solo', duration_seconds: 189, genre: 'Folk', release_year: 2024, vocalist_gender: 'Male Vocals', geography: 'US', lead_instrument: 'Acoustic Guitar', theme: 'Introspective' },
  ];

  const { data: songs, error: songsError } = await supabase
    .from('songs')
    .insert(songsData)
    .select();

  if (songsError) throw songsError;
  console.log(`Created ${songs.length} songs.`);

  console.log('\nCreating diverse listeners...');
  const listenersData = [
    { username: 'casual_listener', email: 'casual@example.com', subscription_fee: 10.99 },
    { username: 'indie_superfan', email: 'indie@example.com', subscription_fee: 10.99 },
    { username: 'pop_lover', email: 'pop@example.com', subscription_fee: 10.99 },
    { username: 'mainstream_user', email: 'mainstream@example.com', subscription_fee: 10.99 },
  ];

  const { data: listeners, error: listenersError } = await supabase
    .from('listeners')
    .insert(listenersData)
    .select();

  if (listenersError) throw listenersError;
  console.log(`Created ${listeners.length} listeners.`);

  console.log('\nCreating realistic play patterns...');
  const allPlays = [];

  const casualListener = listeners[0];
  allPlays.push(...Array(50).fill(null).map(() => ({ listener_id: casualListener.id, song_id: songs[0].id, artist_id: artists[0].id })));
  allPlays.push(...Array(120).fill(null).map(() => ({ listener_id: casualListener.id, song_id: songs[2].id, artist_id: artists[1].id })));
  allPlays.push(...Array(80).fill(null).map(() => ({ listener_id: casualListener.id, song_id: songs[4].id, artist_id: artists[2].id })));
  allPlays.push(...Array(45).fill(null).map(() => ({ listener_id: casualListener.id, song_id: songs[5].id, artist_id: artists[3].id })));

  const indieSuperfan = listeners[1];
  allPlays.push(...Array(5).fill(null).map(() => ({ listener_id: indieSuperfan.id, song_id: songs[0].id, artist_id: artists[0].id })));
  allPlays.push(...Array(850).fill(null).map(() => ({ listener_id: indieSuperfan.id, song_id: songs[8].id, artist_id: artists[6].id })));
  allPlays.push(...Array(1200).fill(null).map(() => ({ listener_id: indieSuperfan.id, song_id: songs[9].id, artist_id: artists[7].id })));
  allPlays.push(...Array(2100).fill(null).map(() => ({ listener_id: indieSuperfan.id, song_id: songs[10].id, artist_id: artists[8].id })));
  allPlays.push(...Array(320).fill(null).map(() => ({ listener_id: indieSuperfan.id, song_id: songs[11].id, artist_id: artists[9].id })));

  const popLover = listeners[2];
  allPlays.push(...Array(245).fill(null).map(() => ({ listener_id: popLover.id, song_id: songs[2].id, artist_id: artists[1].id })));
  allPlays.push(...Array(125).fill(null).map(() => ({ listener_id: popLover.id, song_id: songs[3].id, artist_id: artists[1].id })));
  allPlays.push(...Array(22).fill(null).map(() => ({ listener_id: popLover.id, song_id: songs[0].id, artist_id: artists[0].id })));
  allPlays.push(...Array(180).fill(null).map(() => ({ listener_id: popLover.id, song_id: songs[5].id, artist_id: artists[3].id })));
  allPlays.push(...Array(90).fill(null).map(() => ({ listener_id: popLover.id, song_id: songs[7].id, artist_id: artists[5].id })));

  const mainstreamUser = listeners[3];
  allPlays.push(...Array(350).fill(null).map(() => ({ listener_id: mainstreamUser.id, song_id: songs[0].id, artist_id: artists[0].id })));
  allPlays.push(...Array(280).fill(null).map(() => ({ listener_id: mainstreamUser.id, song_id: songs[1].id, artist_id: artists[0].id })));
  allPlays.push(...Array(150).fill(null).map(() => ({ listener_id: mainstreamUser.id, song_id: songs[2].id, artist_id: artists[1].id })));
  allPlays.push(...Array(200).fill(null).map(() => ({ listener_id: mainstreamUser.id, song_id: songs[4].id, artist_id: artists[2].id })));
  allPlays.push(...Array(120).fill(null).map(() => ({ listener_id: mainstreamUser.id, song_id: songs[6].id, artist_id: artists[4].id })));

  const batchSize = 1000;
  let inserted = 0;
  for (let i = 0; i < allPlays.length; i += batchSize) {
    const batch = allPlays.slice(i, i + batchSize);
    const { error: playsError } = await supabase.from('plays').insert(batch);
    if (playsError) throw playsError;
    inserted += batch.length;
    process.stdout.write(`\rInserted ${inserted} / ${allPlays.length} plays...`);
  }
  console.log(`\nCreated ${allPlays.length} total plays across all listeners.`);

  console.log('\n=== Listener Profiles ===');
  console.log('1. casual_listener (295 plays) - Mainstream mix');
  console.log('2. indie_superfan (4,475 plays) - Indie artist devotee');
  console.log('3. pop_lover (662 plays) - Luna Rivers fan');
  console.log('4. mainstream_user (1,100 plays) - Popular hits only');

  const totalPlatformPlays = artistTiers.reduce((sum, a) => sum + a.platformPlays, 0);
  console.log(`\nTotal ecosystem plays: ${totalPlatformPlays.toLocaleString()}`);
}

async function main() {
  try {
    console.log('Starting simple test data seed...\n');
    await clearDatabase();
    await seedTestData();

    console.log('\n✓ Test data seeded successfully!');
    console.log('\nTest Scenario:');
    console.log('  - Listener: test_user_001');
    console.log('  - Monthly Fee: $10.99');
    console.log('  - Total Plays: 3,582');
    console.log('  - Luna Rivers (Female Vocals): 245 plays (7.67%)');
    console.log('  - Emma Stone (Female Vocals): 125 plays (3.5%)');
    console.log('  - Stellar Nova (Female Vocals): 22 plays (0.6%)');

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

main();
