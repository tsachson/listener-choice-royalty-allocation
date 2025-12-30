export interface Listener {
  id: string;
  username: string;
  email: string;
  subscription_fee: number;
}

export interface Artist {
  id: string;
  name: string;
  image_url: string;
}

export interface Song {
  id: string;
  title: string;
  artist_id: string;
  genre: string;
  release_year: number;
  vocalist_gender: string;
  geography: string;
  lead_instrument: string;
  theme: string;
}

export interface Play {
  listener_id: string;
  song_id: string;
  artist_id: string;
}

export interface ArtistPlayData {
  artist_id: string;
  artist_name: string;
  listener_plays: number;
  total_platform_plays: number;
  songs: Song[];
}

export interface AllocationOption {
  type: 'priority_artists' | 'priority_characteristics' | 'pooled' | 'user_centric' | 'hybrid';
  priorityArtistIds?: string[];
  priorityCharacteristics?: { [key: string]: string[] };
  hybridSplit?: number;
}

export interface ArtistPayout {
  artist_id: string;
  artist_name: string;
  listener_plays: number;
  total_platform_plays: number;
  pct_listener_plays: number;
  pct_platform_plays: number;
  user_centric_payout: number;
  pooled_payout: number;
  total_payout: number;
  is_priority: boolean;
  is_listened: boolean;
}

export interface CalculationResults {
  payouts: ArtistPayout[];
  totalToListenedArtists: number;
  totalToOtherArtists: number;
  subscriptionFee: number;
  priorityPayout: number;
  remainderPayout: number;
}
