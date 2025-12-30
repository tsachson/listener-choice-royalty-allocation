import { supabase } from './supabase';
import type { ArtistPayout, CalculationResults } from './types';

export class RoyaltyCalculator {
  private totalPlatformPlays = 0;
  private artistPlayCounts = new Map<string, { name: string; plays: number }>();

  async initialize() {
    const { count } = await supabase
      .from('plays')
      .select('*', { count: 'exact', head: true });

    this.totalPlatformPlays = count || 0;

    const { data } = await supabase.rpc('get_artist_play_counts');

    if (data) {
      data.forEach((item: any) => {
        this.artistPlayCounts.set(item.artist_id, {
          name: item.artist_name,
          plays: item.play_count,
        });
      });
    }
  }

  async calculateForListener(
    listenerId: string,
    userCentricPercent: number
  ): Promise<CalculationResults> {
    const { data: listener } = await supabase
      .from('listeners')
      .select('subscription_fee')
      .eq('id', listenerId)
      .single();

    if (!listener) {
      return {
        payouts: [],
        totalToYourArtists: 0,
        totalToOtherArtists: 0,
        subscriptionFee: 0,
      };
    }

    const subscriptionFee = listener.subscription_fee;

    const { data: plays } = await supabase
      .from('plays')
      .select('artist_id, artists!inner(name)')
      .eq('listener_id', listenerId);

    if (!plays || plays.length === 0) {
      return {
        payouts: [],
        totalToYourArtists: 0,
        totalToOtherArtists: subscriptionFee,
        subscriptionFee,
      };
    }

    const { data: prefs } = await supabase
      .from('listener_preferences')
      .select('priority_artist_ids')
      .eq('listener_id', listenerId)
      .maybeSingle();

    const priorityArtistIds = new Set(prefs?.priority_artist_ids || []);

    const artistStats = new Map<string, { name: string; plays: number }>();
    plays.forEach((play: any) => {
      const artistId = play.artist_id;
      const artistName = play.artists.name;
      const current = artistStats.get(artistId);
      artistStats.set(artistId, {
        name: artistName,
        plays: (current?.plays || 0) + 1,
      });
    });

    const totalListenerPlays = plays.length;
    const userCentricFraction = userCentricPercent / 100;
    const pooledFraction = 1 - userCentricFraction;

    const payouts: ArtistPayout[] = [];
    let priorityTotal = 0;

    artistStats.forEach((stats, artistId) => {
      const platformPlays = this.artistPlayCounts.get(artistId)?.plays || 0;
      const isPriority = priorityArtistIds.has(artistId);

      const userCentricAmount = (subscriptionFee * stats.plays) / totalListenerPlays;
      const pooledAmount = this.totalPlatformPlays > 0
        ? (subscriptionFee * platformPlays) / this.totalPlatformPlays
        : 0;

      let actualUserCentric = 0;
      let actualPooled = 0;
      let hybridTotal = 0;

      if (isPriority) {
        hybridTotal = userCentricAmount;
        actualUserCentric = userCentricAmount;
        priorityTotal += hybridTotal;
      } else {
        actualUserCentric = userCentricAmount * userCentricFraction;
        actualPooled = pooledAmount * pooledFraction;
        hybridTotal = actualUserCentric + actualPooled;
      }

      payouts.push({
        artist_id: artistId,
        artist_name: stats.name,
        plays_by_listener: stats.plays,
        total_platform_plays: platformPlays,
        user_centric_payout: actualUserCentric,
        pooled_payout: actualPooled,
        hybrid_payout: hybridTotal,
        is_priority: isPriority,
      });
    });

    if (priorityArtistIds.size > 0) {
      const remainingAfterPriority = subscriptionFee - priorityTotal;
      const nonPriorityPayouts = payouts.filter(p => !p.is_priority);
      const nonPriorityTotal = nonPriorityPayouts.reduce(
        (sum, p) => sum + p.hybrid_payout,
        0
      );

      if (nonPriorityTotal > 0 && remainingAfterPriority > 0) {
        const scaleFactor = remainingAfterPriority / nonPriorityTotal;
        nonPriorityPayouts.forEach(p => {
          p.user_centric_payout *= scaleFactor;
          p.pooled_payout *= scaleFactor;
          p.hybrid_payout *= scaleFactor;
        });
      } else if (remainingAfterPriority <= 0) {
        nonPriorityPayouts.forEach(p => {
          p.user_centric_payout = 0;
          p.pooled_payout = 0;
          p.hybrid_payout = 0;
        });
      }
    }

    payouts.sort((a, b) => b.hybrid_payout - a.hybrid_payout);

    const totalToYourArtists = payouts.reduce((sum, p) => sum + p.hybrid_payout, 0);
    const totalToOtherArtists = subscriptionFee - totalToYourArtists;

    return {
      payouts,
      totalToYourArtists,
      totalToOtherArtists: Math.max(0, totalToOtherArtists),
      subscriptionFee,
    };
  }

  async togglePriorityArtist(listenerId: string, artistId: string) {
    const { data: existing } = await supabase
      .from('listener_preferences')
      .select('priority_artist_ids')
      .eq('listener_id', listenerId)
      .maybeSingle();

    const currentIds = new Set(existing?.priority_artist_ids || []);

    if (currentIds.has(artistId)) {
      currentIds.delete(artistId);
    } else {
      currentIds.add(artistId);
    }

    const newIds = Array.from(currentIds);

    if (existing) {
      await supabase
        .from('listener_preferences')
        .update({ priority_artist_ids: newIds, updated_at: new Date().toISOString() })
        .eq('listener_id', listenerId);
    } else {
      await supabase
        .from('listener_preferences')
        .insert({ listener_id: listenerId, priority_artist_ids: newIds });
    }
  }
}
