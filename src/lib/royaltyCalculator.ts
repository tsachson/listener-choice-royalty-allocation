import { ArtistPlayData, AllocationOption, ArtistPayout, CalculationResults } from './types';

export function calculateRoyaltyPayouts(
  subscriptionFee: number,
  artistData: ArtistPlayData[],
  totalPlatformPlays: number,
  allocationOption: AllocationOption
): CalculationResults {
  const { type, priorityArtistIds = [], priorityCharacteristics = {}, hybridSplit = 50 } = allocationOption;

  if (type === 'pooled') {
    return calculatePooled(subscriptionFee, artistData, totalPlatformPlays);
  } else if (type === 'user_centric') {
    return calculateUserCentric(subscriptionFee, artistData, totalPlatformPlays);
  } else if (type === 'hybrid') {
    return calculateHybrid(subscriptionFee, artistData, totalPlatformPlays, hybridSplit);
  } else if (type === 'priority_artists') {
    return calculatePriorityArtists(subscriptionFee, artistData, totalPlatformPlays, priorityArtistIds, hybridSplit);
  } else if (type === 'priority_characteristics') {
    return calculatePriorityCharacteristics(subscriptionFee, artistData, totalPlatformPlays, priorityCharacteristics, hybridSplit);
  }

  return {
    payouts: [],
    totalToListenedArtists: 0,
    totalToOtherArtists: 0,
    subscriptionFee,
    priorityPayout: 0,
    remainderPayout: 0,
  };
}

function calculatePooled(
  subscriptionFee: number,
  artistData: ArtistPlayData[],
  totalPlatformPlays: number
): CalculationResults {
  if (totalPlatformPlays === 0) {
    return {
      payouts: [],
      totalToListenedArtists: 0,
      totalToOtherArtists: subscriptionFee,
      subscriptionFee,
      priorityPayout: 0,
      remainderPayout: subscriptionFee,
    };
  }

  const payouts: ArtistPayout[] = artistData.map(artist => {
    const pooledPayout = (artist.total_platform_plays / totalPlatformPlays) * subscriptionFee;

    return {
      artist_id: artist.artist_id,
      artist_name: artist.artist_name,
      listener_plays: artist.listener_plays,
      total_platform_plays: artist.total_platform_plays,
      pct_listener_plays: artist.listener_plays / artistData.reduce((sum, a) => sum + a.listener_plays, 0),
      pct_platform_plays: artist.listener_plays / artist.total_platform_plays,
      user_centric_payout: 0,
      pooled_payout: pooledPayout,
      total_payout: pooledPayout,
      is_priority: false,
      is_listened: true,
    };
  });

  const totalToListenedArtists = payouts.reduce((sum, p) => sum + p.total_payout, 0);
  const totalToOtherArtists = subscriptionFee - totalToListenedArtists;

  return {
    payouts,
    totalToListenedArtists,
    totalToOtherArtists,
    subscriptionFee,
    priorityPayout: 0,
    remainderPayout: subscriptionFee,
  };
}

function calculateUserCentric(
  subscriptionFee: number,
  artistData: ArtistPlayData[],
  totalPlatformPlays: number
): CalculationResults {
  const totalListenerPlays = artistData.reduce((sum, artist) => sum + artist.listener_plays, 0);

  if (totalListenerPlays === 0) {
    return {
      payouts: [],
      totalToListenedArtists: 0,
      totalToOtherArtists: subscriptionFee,
      subscriptionFee,
      priorityPayout: 0,
      remainderPayout: subscriptionFee,
    };
  }

  const payouts: ArtistPayout[] = artistData.map(artist => {
    const userCentricPayout = (artist.listener_plays / totalListenerPlays) * subscriptionFee;

    return {
      artist_id: artist.artist_id,
      artist_name: artist.artist_name,
      listener_plays: artist.listener_plays,
      total_platform_plays: artist.total_platform_plays,
      pct_listener_plays: artist.listener_plays / totalListenerPlays,
      pct_platform_plays: artist.listener_plays / artist.total_platform_plays,
      user_centric_payout: userCentricPayout,
      pooled_payout: 0,
      total_payout: userCentricPayout,
      is_priority: false,
      is_listened: true,
    };
  });

  return {
    payouts,
    totalToListenedArtists: subscriptionFee,
    totalToOtherArtists: 0,
    subscriptionFee,
    priorityPayout: 0,
    remainderPayout: subscriptionFee,
  };
}

function calculateHybrid(
  subscriptionFee: number,
  artistData: ArtistPlayData[],
  totalPlatformPlays: number,
  userCentricPercentage: number
): CalculationResults {
  const totalListenerPlays = artistData.reduce((sum, artist) => sum + artist.listener_plays, 0);

  if (totalListenerPlays === 0 || totalPlatformPlays === 0) {
    return {
      payouts: [],
      totalToListenedArtists: 0,
      totalToOtherArtists: subscriptionFee,
      subscriptionFee,
      priorityPayout: 0,
      remainderPayout: subscriptionFee,
    };
  }

  const userCentricAmount = subscriptionFee * (userCentricPercentage / 100);
  const pooledAmount = subscriptionFee * ((100 - userCentricPercentage) / 100);

  const userCentricFraction = userCentricPercentage / 100;
  const pooledFraction = (100 - userCentricPercentage) / 100;

  const adjustedTotalPlatformPlays = totalPlatformPlays - (totalListenerPlays * userCentricFraction);

  const payouts: ArtistPayout[] = artistData.map(artist => {
    const userCentricPayout = (artist.listener_plays / totalListenerPlays) * userCentricAmount;

    const adjustedPlatformPlaysForArtist = artist.total_platform_plays - (artist.listener_plays * userCentricFraction);
    const pooledPayout = (adjustedPlatformPlaysForArtist / adjustedTotalPlatformPlays) * pooledAmount;

    return {
      artist_id: artist.artist_id,
      artist_name: artist.artist_name,
      listener_plays: artist.listener_plays,
      total_platform_plays: artist.total_platform_plays,
      pct_listener_plays: artist.listener_plays / totalListenerPlays,
      pct_platform_plays: artist.listener_plays / artist.total_platform_plays,
      user_centric_payout: userCentricPayout,
      pooled_payout: pooledPayout,
      total_payout: userCentricPayout + pooledPayout,
      is_priority: false,
      is_listened: true,
    };
  });

  const totalToListenedArtists = payouts.reduce((sum, p) => sum + p.total_payout, 0);
  const totalToOtherArtists = subscriptionFee - totalToListenedArtists;

  return {
    payouts,
    totalToListenedArtists,
    totalToOtherArtists,
    subscriptionFee,
    priorityPayout: 0,
    remainderPayout: subscriptionFee,
  };
}

function calculatePriorityArtists(
  subscriptionFee: number,
  artistData: ArtistPlayData[],
  totalPlatformPlays: number,
  priorityArtistIds: string[],
  remainderHybridSplit: number
): CalculationResults {
  const totalListenerPlays = artistData.reduce((sum, artist) => sum + artist.listener_plays, 0);

  if (totalListenerPlays === 0 || totalPlatformPlays === 0) {
    return {
      payouts: [],
      totalToListenedArtists: 0,
      totalToOtherArtists: subscriptionFee,
      subscriptionFee,
      priorityPayout: 0,
      remainderPayout: subscriptionFee,
    };
  }

  const priorityArtists = artistData.filter(artist => priorityArtistIds.includes(artist.artist_id));
  const nonPriorityArtists = artistData.filter(artist => !priorityArtistIds.includes(artist.artist_id));

  const priorityPlays = priorityArtists.reduce((sum, artist) => sum + artist.listener_plays, 0);
  const nonPriorityPlays = nonPriorityArtists.reduce((sum, artist) => sum + artist.listener_plays, 0);

  const priorityAmount = (priorityPlays / totalListenerPlays) * subscriptionFee;
  const remainderAmount = subscriptionFee - priorityAmount;

  const priorityPayouts: ArtistPayout[] = priorityArtists.map(artist => {
    const userCentricPayout = priorityPlays > 0
      ? (artist.listener_plays / priorityPlays) * priorityAmount
      : 0;

    return {
      artist_id: artist.artist_id,
      artist_name: artist.artist_name,
      listener_plays: artist.listener_plays,
      total_platform_plays: artist.total_platform_plays,
      pct_listener_plays: artist.listener_plays / totalListenerPlays,
      pct_platform_plays: artist.listener_plays / artist.total_platform_plays,
      user_centric_payout: userCentricPayout,
      pooled_payout: 0,
      total_payout: userCentricPayout,
      is_priority: true,
      is_listened: true,
    };
  });

  const userCentricFraction = remainderHybridSplit / 100;
  const pooledFraction = (100 - remainderHybridSplit) / 100;

  const remainderUserCentricAmount = remainderAmount * userCentricFraction;
  const remainderPooledAmount = remainderAmount * pooledFraction;

  const nonPriorityPayouts: ArtistPayout[] = nonPriorityArtists.map(artist => {
    const userCentricPayout = nonPriorityPlays > 0
      ? (artist.listener_plays / nonPriorityPlays) * remainderUserCentricAmount
      : 0;

    const pooledPayout = totalPlatformPlays > 0
      ? (artist.total_platform_plays / totalPlatformPlays) * remainderPooledAmount
      : 0;

    return {
      artist_id: artist.artist_id,
      artist_name: artist.artist_name,
      listener_plays: artist.listener_plays,
      total_platform_plays: artist.total_platform_plays,
      pct_listener_plays: artist.listener_plays / totalListenerPlays,
      pct_platform_plays: artist.listener_plays / artist.total_platform_plays,
      user_centric_payout: userCentricPayout,
      pooled_payout: pooledPayout,
      total_payout: userCentricPayout + pooledPayout,
      is_priority: false,
      is_listened: true,
    };
  });

  const payouts = [...priorityPayouts, ...nonPriorityPayouts];
  const totalToListenedArtists = payouts.reduce((sum, p) => sum + p.total_payout, 0);
  const totalToOtherArtists = subscriptionFee - totalToListenedArtists;

  return {
    payouts,
    totalToListenedArtists,
    totalToOtherArtists,
    subscriptionFee,
    priorityPayout: priorityAmount,
    remainderPayout: remainderAmount,
  };
}

function calculatePriorityCharacteristics(
  subscriptionFee: number,
  artistData: ArtistPlayData[],
  totalPlatformPlays: number,
  priorityCharacteristics: { [key: string]: string[] },
  remainderHybridSplit: number
): CalculationResults {
  const totalListenerPlays = artistData.reduce((sum, artist) => sum + artist.listener_plays, 0);

  if (totalListenerPlays === 0 || totalPlatformPlays === 0) {
    return {
      payouts: [],
      totalToListenedArtists: 0,
      totalToOtherArtists: subscriptionFee,
      subscriptionFee,
      priorityPayout: 0,
      remainderPayout: subscriptionFee,
    };
  }

  const hasAnyCharacteristicsSelected = Object.values(priorityCharacteristics).some(values => values.length > 0);

  if (!hasAnyCharacteristicsSelected) {
    return calculateHybrid(subscriptionFee, artistData, totalPlatformPlays, remainderHybridSplit);
  }

  const matchesCharacteristics = (artist: ArtistPlayData): boolean => {
    const characteristicsWithValues = Object.entries(priorityCharacteristics).filter(([_, values]) => values.length > 0);

    if (characteristicsWithValues.length === 0) return false;

    return characteristicsWithValues.some(([characteristic, values]) => {
      return artist.songs.some(song => {
        const songValue = (song as any)[characteristic];
        return values.includes(songValue);
      });
    });
  };

  const priorityArtists = artistData.filter(matchesCharacteristics);
  const nonPriorityArtists = artistData.filter(artist => !matchesCharacteristics(artist));

  const priorityPlays = priorityArtists.reduce((sum, artist) => sum + artist.listener_plays, 0);
  const nonPriorityPlays = nonPriorityArtists.reduce((sum, artist) => sum + artist.listener_plays, 0);

  const priorityAmount = (priorityPlays / totalListenerPlays) * subscriptionFee;
  const remainderAmount = subscriptionFee - priorityAmount;

  const priorityPayouts: ArtistPayout[] = priorityArtists.map(artist => {
    const userCentricPayout = priorityPlays > 0
      ? (artist.listener_plays / priorityPlays) * priorityAmount
      : 0;

    return {
      artist_id: artist.artist_id,
      artist_name: artist.artist_name,
      listener_plays: artist.listener_plays,
      total_platform_plays: artist.total_platform_plays,
      pct_listener_plays: artist.listener_plays / totalListenerPlays,
      pct_platform_plays: artist.listener_plays / artist.total_platform_plays,
      user_centric_payout: userCentricPayout,
      pooled_payout: 0,
      total_payout: userCentricPayout,
      is_priority: true,
      is_listened: true,
    };
  });

  const userCentricFraction = remainderHybridSplit / 100;
  const pooledFraction = (100 - remainderHybridSplit) / 100;

  const remainderUserCentricAmount = remainderAmount * userCentricFraction;
  const remainderPooledAmount = remainderAmount * pooledFraction;

  const nonPriorityPayouts: ArtistPayout[] = nonPriorityArtists.map(artist => {
    const userCentricPayout = nonPriorityPlays > 0
      ? (artist.listener_plays / nonPriorityPlays) * remainderUserCentricAmount
      : 0;

    const pooledPayout = totalPlatformPlays > 0
      ? (artist.total_platform_plays / totalPlatformPlays) * remainderPooledAmount
      : 0;

    return {
      artist_id: artist.artist_id,
      artist_name: artist.artist_name,
      listener_plays: artist.listener_plays,
      total_platform_plays: artist.total_platform_plays,
      pct_listener_plays: artist.listener_plays / totalListenerPlays,
      pct_platform_plays: artist.listener_plays / artist.total_platform_plays,
      user_centric_payout: userCentricPayout,
      pooled_payout: pooledPayout,
      total_payout: userCentricPayout + pooledPayout,
      is_priority: false,
      is_listened: true,
    };
  });

  const payouts = [...priorityPayouts, ...nonPriorityPayouts];
  const totalToListenedArtists = payouts.reduce((sum, p) => sum + p.total_payout, 0);
  const totalToOtherArtists = subscriptionFee - totalToListenedArtists;

  return {
    payouts,
    totalToListenedArtists,
    totalToOtherArtists,
    subscriptionFee,
    priorityPayout: priorityAmount,
    remainderPayout: remainderAmount,
  };
}
