import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const ARTIST_NAME_PREFIXES = [
  'Happy', 'Smoking', 'Dancing', 'Flying', 'Jumping', 'Running', 'Singing', 'Dreaming',
  'Blazing', 'Electric', 'Cosmic', 'Lunar', 'Solar', 'Midnight', 'Golden', 'Silver',
  'Crystal', 'Diamond', 'Rainbow', 'Thunder', 'Lightning', 'Stormy', 'Sunny', 'Cloudy',
  'Wild', 'Crazy', 'Funky', 'Groovy', 'Jazzy', 'Blues', 'Rock', 'Metal', 'Punk', 'Soul'
];

const ARTIST_NAME_SUFFIXES = [
  'Sam', 'Sally', 'Joe', 'Jane', 'Bob', 'Betty', 'Jack', 'Jill', 'Max', 'Molly',
  'Charlie', 'Chloe', 'Duke', 'Daisy', 'Rex', 'Ruby', 'Lucky', 'Luna', 'Bear', 'Bella',
  'Madness', 'Dreams', 'Vibes', 'Sounds', 'Beats', 'Rhythm', 'Melody', 'Harmony',
  'Symphony', 'Orchestra', 'Band', 'Crew', 'Squad', 'Gang', 'Posse', 'Tribe'
];

const BAND_NAMES = [
  'The Velvet Shadows', 'Neon Pulse', 'Crimson Echo', 'Azure Dreams', 'The Wild Roses',
  'Starlight Express', 'The Funky Monks', 'Electric Sheep', 'The Cosmic Drifters',
  'Sunset Boulevard', 'The Urban Legends', 'Twilight Symphony', 'The Night Owls',
  'Golden Hour', 'The Silent Storm', 'Moonlight Sonata', 'The Raging Bulls',
  'Crystal Vision', 'The Lost Souls', 'Emerald City', 'The Rebel Hearts',
  'Silver Lining', 'The Free Spirits', 'Violet Haze', 'The Time Travelers'
];

const GENRES = ['Rock', 'Pop', 'Jazz', 'Hip-Hop', 'Country', 'Electronic', 'R&B', 'Classical', 'Folk', 'Blues', 'Metal', 'Indie'];
const VOCALIST_GENDERS = ['Male Vocals', 'Female Vocals', 'Mixed Vocals', 'Instrumental'];
const GEOGRAPHIES = ['US', 'UK', 'Canada', 'Europe', 'Asia', 'Latin America', 'Australia', 'Global'];
const LEAD_INSTRUMENTS = ['Guitar', 'Piano', 'Synth', 'Drums', 'Violin', 'Bass', 'Vocals', 'Saxophone'];
const THEMES = ['Love', 'Party', 'Introspective', 'Political', 'Nature', 'Urban Life', 'Heartbreak', 'Celebration'];

function generateArtistName(): string {
  const random = Math.random();

  if (random < 0.4) {
    const prefix = ARTIST_NAME_PREFIXES[Math.floor(Math.random() * ARTIST_NAME_PREFIXES.length)];
    const suffix = ARTIST_NAME_SUFFIXES[Math.floor(Math.random() * ARTIST_NAME_SUFFIXES.length)];
    return `${prefix} ${suffix}`;
  } else if (random < 0.6) {
    return BAND_NAMES[Math.floor(Math.random() * BAND_NAMES.length)];
  } else {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    return Math.random() > 0.5 ? `${firstName} and the ${ARTIST_NAME_SUFFIXES[Math.floor(Math.random() * ARTIST_NAME_SUFFIXES.length)]}` : `${firstName} ${lastName}`;
  }
}

async function clearDatabase() {
  console.log('Clearing existing data...');
  await supabase.from('plays').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('listener_preferences').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('songs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('listeners').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('artists').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('Database cleared.');
}

async function seedArtists(count: number) {
  console.log(`Creating ${count} artists...`);
  const artists = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    let name = generateArtistName();
    while (usedNames.has(name)) {
      name = generateArtistName();
    }
    usedNames.add(name);

    artists.push({
      name,
      image_url: `https://i.pravatar.cc/150?img=${i % 70}`,
    });
  }

  const { data, error } = await supabase.from('artists').insert(artists).select();
  if (error) throw error;
  console.log(`Created ${data.length} artists.`);
  return data;
}

async function seedSongs(artists: any[]) {
  console.log(`Creating songs (1 per artist)...`);
  const songs = [];

  for (const artist of artists) {
    const releaseYear = faker.number.int({ min: 1960, max: 2024 });

    songs.push({
      title: faker.music.songName(),
      artist_id: artist.id,
      album: faker.music.album(),
      duration_seconds: faker.number.int({ min: 120, max: 300 }),
      genre: faker.helpers.arrayElement(GENRES),
      release_year: releaseYear,
      vocalist_gender: faker.helpers.arrayElement(VOCALIST_GENDERS),
      geography: faker.helpers.arrayElement(GEOGRAPHIES),
      lead_instrument: faker.helpers.arrayElement(LEAD_INSTRUMENTS),
      theme: faker.helpers.arrayElement(THEMES),
    });
  }

  const { data, error } = await supabase.from('songs').insert(songs).select();
  if (error) throw error;
  console.log(`Created ${data.length} songs.`);
  return data;
}

async function seedListeners(count: number) {
  console.log(`Creating ${count} listeners...`);
  const listeners = [];

  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = `${firstName}.${lastName}-${faker.number.int({ min: 1000, max: 9999 })}`.toLowerCase();

    listeners.push({
      username,
      email: `${username}@${faker.internet.domainName()}`,
      subscription_fee: 13.99,
    });
  }

  const { data, error } = await supabase.from('listeners').insert(listeners).select();
  if (error) throw error;
  console.log(`Created ${data.length} listeners.`);
  return data;
}

function generateRealisticPlayCount(): number {
  const random = Math.random();

  if (random < 0.15) {
    return faker.number.int({ min: 20, max: 100 });
  } else if (random < 0.35) {
    return faker.number.int({ min: 100, max: 300 });
  } else if (random < 0.60) {
    return faker.number.int({ min: 300, max: 800 });
  } else if (random < 0.80) {
    return faker.number.int({ min: 800, max: 1500 });
  } else if (random < 0.95) {
    return faker.number.int({ min: 1500, max: 3500 });
  } else {
    return faker.number.int({ min: 3500, max: 8000 });
  }
}

async function seedPlays(listeners: any[], songs: any[], artists: any[]) {
  console.log(`Creating realistic play patterns with high variability...`);
  const batchSize = 1000;
  let totalPlays = 0;

  const artistPopularity = artists.map((artist, idx) => ({
    artist,
    popularityScore: Math.random() * Math.random(),
    avgPlaysPerListener: 0,
  }));

  artistPopularity.sort((a, b) => b.popularityScore - a.popularityScore);

  const superstarCount = Math.ceil(artists.length * 0.02);
  const popularCount = Math.ceil(artists.length * 0.10);
  const midTierCount = Math.ceil(artists.length * 0.25);

  for (let idx = 0; idx < listeners.length; idx++) {
    const listener = listeners[idx];
    const numPlays = generateRealisticPlayCount();
    const plays = [];

    const listenerType = Math.random();
    let songPool: any[] = [];

    if (listenerType < 0.25) {
      const favoriteSongs = faker.helpers.arrayElements(songs, faker.number.int({ min: 3, max: 15 }));
      for (let i = 0; i < numPlays; i++) {
        const song = Math.random() < 0.7
          ? faker.helpers.arrayElement(favoriteSongs)
          : faker.helpers.arrayElement(songs);
        songPool.push(song);
      }
    } else if (listenerType < 0.55) {
      const popularSongs = artistPopularity.slice(0, popularCount).map(ap =>
        songs.find(s => s.artist_id === ap.artist.id)
      ).filter(Boolean);
      for (let i = 0; i < numPlays; i++) {
        const song = Math.random() < 0.6
          ? faker.helpers.arrayElement(popularSongs)
          : faker.helpers.arrayElement(songs);
        songPool.push(song);
      }
    } else {
      for (let i = 0; i < numPlays; i++) {
        songPool.push(faker.helpers.arrayElement(songs));
      }
    }

    for (const song of songPool) {
      plays.push({
        listener_id: listener.id,
        song_id: song.id,
        artist_id: song.artist_id,
        played_at: faker.date.recent({ days: 30 }),
      });
    }

    for (let i = 0; i < plays.length; i += batchSize) {
      const batch = plays.slice(i, i + batchSize);
      const { error } = await supabase.from('plays').insert(batch);
      if (error) throw error;
      totalPlays += batch.length;
      process.stdout.write(`\rInserted ${totalPlays.toLocaleString()} plays (Listener ${idx + 1}/${listeners.length})...`);
    }
  }

  console.log(`\nCreated ${totalPlays.toLocaleString()} total plays with realistic variability.`);

  const artistPlayCounts = await supabase
    .from('plays')
    .select('artist_id, artists!inner(name)')
    .then(({ data }) => {
      const counts: { [key: string]: { name: string; count: number } } = {};
      data?.forEach(play => {
        const artistName = (play.artists as any).name;
        if (!counts[artistName]) {
          counts[artistName] = { name: artistName, count: 0 };
        }
        counts[artistName].count++;
      });
      return Object.values(counts).sort((a, b) => b.count - a.count);
    });

  console.log('\nTop 10 Artists by Platform Plays:');
  artistPlayCounts.slice(0, 10).forEach((artist, idx) => {
    console.log(`  ${idx + 1}. ${artist.name}: ${artist.count.toLocaleString()} plays`);
  });

  console.log('\nBottom 10 Artists by Platform Plays:');
  artistPlayCounts.slice(-10).forEach((artist, idx) => {
    console.log(`  ${idx + 1}. ${artist.name}: ${artist.count.toLocaleString()} plays`);
  });
}

async function main() {
  try {
    console.log('Starting database seed...\n');
    console.log('This will create:');
    console.log('  - 500 artists (each with 1 song)');
    console.log('  - 1,000 listeners ($13.99/month subscription)');
    console.log('  - Highly variable play counts (20-8,000 per listener)');
    console.log('  - Realistic listener behavior patterns');
    console.log('');

    await clearDatabase();

    const artists = await seedArtists(500);
    const songs = await seedSongs(artists);
    const listeners = await seedListeners(1000);
    await seedPlays(listeners, songs, artists);

    const { count: totalPlays } = await supabase
      .from('plays')
      .select('*', { count: 'exact', head: true });

    console.log('\n✓ Database seeded successfully!');
    console.log(`\nFinal Stats:`);
    console.log(`  - ${artists.length} artists`);
    console.log(`  - ${songs.length} songs`);
    console.log(`  - ${listeners.length} listeners @ $13.99/month`);
    console.log(`  - ${totalPlays?.toLocaleString()} total monthly platform plays`);
    console.log(`  - Average: ${Math.round((totalPlays || 0) / listeners.length)} plays per listener`);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

main();
