import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Listener, ArtistPlayData, AllocationOption, CalculationResults } from './lib/types';
import { calculateRoyaltyPayouts } from './lib/royaltyCalculator';
import { Music, DollarSign, Play, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { PieChart } from './components/PieChart';

interface ArtistStats {
  artist_id: string;
  artist_name: string;
  listener_plays: number;
  total_platform_plays: number;
  songs: any[];
}

export default function App() {
  const [listeners, setListeners] = useState<Listener[]>([]);
  const [selectedListener, setSelectedListener] = useState<Listener | null>(null);
  const [artistStats, setArtistStats] = useState<ArtistStats[]>([]);
  const [totalPlatformPlays, setTotalPlatformPlays] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const [allocationOption, setAllocationOption] = useState<AllocationOption>({
    type: 'user_centric',
    hybridSplit: 50,
    priorityArtistIds: [],
    priorityCharacteristics: {},
  });

  const [results, setResults] = useState<CalculationResults | null>(null);
  const [sortColumn, setSortColumn] = useState<string>('artist_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const characteristicOptions = {
    genre: ['Rock', 'Pop', 'Jazz', 'Hip-Hop', 'Country', 'Electronic', 'R&B', 'Classical', 'Folk', 'Blues', 'Metal', 'Indie'],
    vocalist_gender: ['Male Vocals', 'Female Vocals', 'Mixed Vocals', 'Instrumental'],
    geography: ['US', 'UK', 'Canada', 'Europe', 'Asia', 'Latin America', 'Australia', 'Global'],
    lead_instrument: ['Guitar', 'Piano', 'Synth', 'Drums', 'Violin', 'Bass', 'Vocals', 'Saxophone'],
    theme: ['Love', 'Party', 'Introspective', 'Political', 'Nature', 'Urban Life', 'Heartbreak', 'Celebration'],
  };

  useEffect(() => {
    loadListeners();
    loadTotalPlatformPlays();
  }, []);

  useEffect(() => {
    if (selectedListener) {
      loadListenerData(selectedListener.id);
    }
  }, [selectedListener]);

  useEffect(() => {
    if (selectedListener) {
      if (artistStats.length > 0 && totalPlatformPlays > 0) {
        calculatePayouts();
      } else {
        setResults(null);
      }
    }
  }, [artistStats, allocationOption, selectedListener, totalPlatformPlays]);

  async function loadListeners() {
    const { data, error } = await supabase
      .from('listeners')
      .select('*')
      .order('username');

    if (data && !error) {
      setListeners(data);
      if (data.length > 0) {
        setSelectedListener(data[0]);
      }
    }
    setLoading(false);
  }

  async function loadTotalPlatformPlays() {
    const { data, error } = await supabase
      .rpc('get_total_platform_plays');

    if (!error && data !== null) {
      setTotalPlatformPlays(data);
    }
  }

  async function loadListenerData(listenerId: string) {
    const { data: listenerPlayCounts, error: listenerError } = await supabase.rpc('get_listener_artist_stats', {
      p_listener_id: listenerId
    });

    if (listenerError || !listenerPlayCounts || listenerPlayCounts.length === 0) {
      setArtistStats([]);
      return;
    }

    setArtistStats(listenerPlayCounts);
  }

  function calculatePayouts() {
    if (!selectedListener || artistStats.length === 0) return;

    const results = calculateRoyaltyPayouts(
      selectedListener.subscription_fee,
      artistStats,
      totalPlatformPlays,
      allocationOption
    );

    setResults(results);
  }

  function togglePriorityArtist(artistId: string) {
    const currentIds = allocationOption.priorityArtistIds || [];
    const newIds = currentIds.includes(artistId)
      ? currentIds.filter(id => id !== artistId)
      : [...currentIds, artistId];

    setAllocationOption({
      ...allocationOption,
      priorityArtistIds: newIds,
    });
  }

  function toggleCharacteristic(characteristic: string, value: string) {
    const current = allocationOption.priorityCharacteristics || {};
    const currentValues = current[characteristic] || [];

    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];

    setAllocationOption({
      ...allocationOption,
      priorityCharacteristics: {
        ...current,
        [characteristic]: newValues,
      },
    });
  }

  function handleSort(column: string) {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  }

  const sortedPayouts = results ? [...results.payouts].sort((a, b) => {
    let aVal: any = a[sortColumn as keyof typeof a];
    let bVal: any = b[sortColumn as keyof typeof b];

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  }) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-xl text-slate-600">Loading...</div>
      </div>
    );
  }

  const totalListenerPlays = artistStats.reduce((sum, a) => sum + a.listener_plays, 0);
  const uniqueArtists = artistStats.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <header className="text-center space-y-2 py-8">
          <h1 className="text-4xl font-bold text-slate-900">Listener's Choice Music Royalty Engine</h1>
          <p className="text-lg text-slate-600">Where the fans decide how their monthly subscription fees support the music they love</p>

          <div className="flex gap-4 justify-center items-start mt-8">
            <a
              href="https://drive.google.com/file/d/1uYbDhd231yTvatLhYaRc0VXIN02Iy2ix/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="w-48 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
            >
              <img
                src="/picture1.png"
                alt="Royalty Allocation Primitives Overview"
                className="w-full h-auto"
              />
            </a>
            <a
              href="https://drive.google.com/file/d/1uYbDhd231yTvatLhYaRc0VXIN02Iy2ix/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="w-48 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
            >
              <img
                src="/picture2.png"
                alt="Patent Application Document"
                className="w-full h-auto"
              />
            </a>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-slate-600 mb-1">For complete background information on this Royalty Allocation Engine:</p>
            <p className="text-sm">
              <a href="https://www.AgenticYears.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                https://www.AgenticYears.com
              </a>
              <span className="text-slate-600 mx-2">|</span>
              <a href="mailto:tsachson@gmail.com" className="text-blue-600 hover:text-blue-800 hover:underline">
                tsachson@gmail.com
              </a>
            </p>
          </div>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-2">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Select Listener</label>
          <select
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            value={selectedListener?.id || ''}
            onChange={(e) => {
              const listener = listeners.find(l => l.id === e.target.value);
              setSelectedListener(listener || null);
            }}
          >
            {listeners.map(listener => (
              <option key={listener.id} value={listener.id}>
                {listener.username}
              </option>
            ))}
          </select>
        </div>

        {selectedListener && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-3">
                <fieldset className="border-2 border-blue-300 rounded-xl p-6 bg-blue-50/30">
                  <legend className="px-3 text-sm font-semibold text-blue-700">
                    {selectedListener.username}'s Core Monthly Consumption Data
                  </legend>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-100 rounded-lg">
                          <DollarSign className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <div className="text-sm text-slate-600">Monthly Fee</div>
                          <div className="text-2xl font-bold text-slate-900">${selectedListener.subscription_fee.toFixed(2)}</div>
                          <div className="text-xs text-slate-500 mt-1">(hypothetical only, does not take into consideration DSP operational costs)</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Play className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm text-slate-600">Total Listener Plays</div>
                          <div className="text-2xl font-bold text-slate-900">{totalListenerPlays.toLocaleString()}</div>
                          <div className="text-xs text-slate-500 mt-1">(Single Month)</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-violet-100 rounded-lg">
                          <Users className="w-6 h-6 text-violet-600" />
                        </div>
                        <div>
                          <div className="text-sm text-slate-600">Unique Artists Played</div>
                          <div className="text-2xl font-bold text-slate-900">{uniqueArtists}</div>
                          <div className="text-xs text-slate-500 mt-1">(Single Month)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </fieldset>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <Music className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-600">Total Platform Plays</div>
                    <div className="text-2xl font-bold text-slate-900">{(totalPlatformPlays / 1000000).toFixed(1)}M</div>
                    <div className="text-xs text-slate-500 mt-0.5">{totalPlatformPlays.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Listener's Monthly Allocation Method</h2>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {[
                  { value: 'user_centric', label: '100% User-Centric Model', desc: 'Listener\'s entire monthly subscription fee paid pro rata to artists streamed by listener' },
                  { value: 'pooled', label: '100% Pooled Model', desc: 'Listener\'s entire monthly subscription fee paid into platform wide royalty pool for pro rata distributions to all artists on platform' },
                  { value: 'hybrid', label: 'Hybrid Splits Model', desc: 'Mix of both User-Centric and Pooled Models' },
                  { value: 'priority_artists', label: 'Priority Artists Splits Model', desc: 'Pay selected artists first' },
                  { value: 'priority_characteristics', label: 'Priority Music Traits Splits Model', desc: 'Pay selected music characteristics first' },
                ].map(option => {
                  const getSummaryForOption = () => {
                    if (!results) return null;

                    const totalUserCentric = results.payouts.reduce((sum, p) => sum + p.user_centric_payout, 0);
                    const totalPooled = results.payouts.reduce((sum, p) => sum + p.pooled_payout, 0);

                    switch (option.value) {
                      case 'user_centric':
                        return (
                          <div className="text-xs text-slate-600 mt-2 pt-2 border-t border-slate-200">
                            <div className="space-y-0.5 mb-3">
                              <div>User-Centric Payout to artists streamed by listener: <span className="font-bold text-green-600">${results.totalToListenedArtists.toFixed(2)}</span></div>
                            </div>
                            <div className="flex items-end justify-center min-h-[140px]">
                              <PieChart slices={[
                                { value: results.totalToListenedArtists, color: '#16a34a' }
                              ]} />
                            </div>
                          </div>
                        );
                      case 'pooled':
                        return (
                          <div className="text-xs text-slate-600 mt-2 pt-2 border-t border-slate-200">
                            <div className="space-y-0.5 mb-3">
                              <div>Pooled Payout to artists streamed by listener: <span className="font-bold text-yellow-600">${results.totalToListenedArtists.toFixed(2)}</span></div>
                              <div>Pooled Payout to artists NOT streamed by listener: <span className="font-bold text-red-600">${results.totalToOtherArtists.toFixed(2)}</span></div>
                            </div>
                            <div className="flex items-end justify-center min-h-[140px]">
                              <PieChart slices={[
                                { value: results.totalToListenedArtists, color: '#ca8a04' },
                                { value: results.totalToOtherArtists, color: '#dc2626' }
                              ]} />
                            </div>
                          </div>
                        );
                      case 'hybrid':
                        return (
                          <div className="text-xs text-slate-600 mt-2 pt-2 border-t border-slate-200">
                            <div className="space-y-0.5 mb-3">
                              <div>User-Centric Payout to artists streamed by listener: <span className="font-bold text-green-600">${totalUserCentric.toFixed(2)}</span></div>
                              <div>Pooled Payout to artists streamed by listener: <span className="font-bold text-yellow-600">${totalPooled.toFixed(2)}</span></div>
                              <div>Pooled Payout to artists NOT streamed by listener: <span className="font-bold text-red-600">${results.totalToOtherArtists.toFixed(2)}</span></div>
                            </div>
                            <div className="flex items-end justify-center min-h-[140px]">
                              <PieChart slices={[
                                { value: totalUserCentric, color: '#16a34a' },
                                { value: totalPooled, color: '#ca8a04' },
                                { value: results.totalToOtherArtists, color: '#dc2626' }
                              ]} />
                            </div>
                          </div>
                        );
                      case 'priority_artists':
                        const priorityArtistTotal = results.payouts.filter(p => p.is_priority).reduce((sum, p) => sum + p.total_payout, 0);
                        const nonPriorityUserCentric = results.payouts.filter(p => !p.is_priority).reduce((sum, p) => sum + p.user_centric_payout, 0);
                        const nonPriorityPooled = results.payouts.filter(p => !p.is_priority).reduce((sum, p) => sum + p.pooled_payout, 0);
                        return (
                          <div className="text-xs text-slate-600 mt-2 pt-2 border-t border-slate-200">
                            <div className="space-y-0.5 mb-3">
                              <div>Priority Artists Payout: <span className="font-bold text-purple-600">${priorityArtistTotal.toFixed(2)}</span></div>
                              <div>User-Centric Payout to artists streamed by listener: <span className="font-bold text-green-600">${nonPriorityUserCentric.toFixed(2)}</span></div>
                              <div>Pooled Payout to artists streamed by listener: <span className="font-bold text-yellow-600">${nonPriorityPooled.toFixed(2)}</span></div>
                              <div>Pooled Payout to artists NOT streamed by listener: <span className="font-bold text-red-600">${results.totalToOtherArtists.toFixed(2)}</span></div>
                            </div>
                            <div className="flex items-end justify-center min-h-[140px]">
                              <PieChart slices={[
                                { value: priorityArtistTotal, color: '#9333ea' },
                                { value: nonPriorityUserCentric, color: '#16a34a' },
                                { value: nonPriorityPooled, color: '#ca8a04' },
                                { value: results.totalToOtherArtists, color: '#dc2626' }
                              ]} />
                            </div>
                          </div>
                        );
                      case 'priority_characteristics':
                        const priorityCharTotal = results.payouts.filter(p => p.is_priority).reduce((sum, p) => sum + p.total_payout, 0);
                        const nonPriorityCharUserCentric = results.payouts.filter(p => !p.is_priority).reduce((sum, p) => sum + p.user_centric_payout, 0);
                        const nonPriorityCharPooled = results.payouts.filter(p => !p.is_priority).reduce((sum, p) => sum + p.pooled_payout, 0);
                        return (
                          <div className="text-xs text-slate-600 mt-2 pt-2 border-t border-slate-200">
                            <div className="space-y-0.5 mb-3">
                              <div>Priority Traits Payout: <span className="font-bold text-purple-600">${priorityCharTotal.toFixed(2)}</span></div>
                              <div>User-Centric Payout to artists streamed by listener: <span className="font-bold text-green-600">${nonPriorityCharUserCentric.toFixed(2)}</span></div>
                              <div>Pooled Payout to artists streamed by listener: <span className="font-bold text-yellow-600">${nonPriorityCharPooled.toFixed(2)}</span></div>
                              <div>Pooled Payout to artists NOT streamed by listener: <span className="font-bold text-red-600">${results.totalToOtherArtists.toFixed(2)}</span></div>
                            </div>
                            <div className="flex items-end justify-center min-h-[140px]">
                              <PieChart slices={[
                                { value: priorityCharTotal, color: '#9333ea' },
                                { value: nonPriorityCharUserCentric, color: '#16a34a' },
                                { value: nonPriorityCharPooled, color: '#ca8a04' },
                                { value: results.totalToOtherArtists, color: '#dc2626' }
                              ]} />
                            </div>
                          </div>
                        );
                      default:
                        return null;
                    }
                  };

                  return (
                    <button
                      key={option.value}
                      onClick={() => setAllocationOption({ ...allocationOption, type: option.value as any })}
                      className={`p-4 rounded-lg border-2 text-left transition-all flex flex-col ${
                        allocationOption.type === option.value
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{option.label}</div>
                        <div className="text-xs text-slate-600 mt-1">{option.desc}</div>
                      </div>
                      <div className="mt-auto">
                        {getSummaryForOption()}
                      </div>
                    </button>
                  );
                })}
              </div>

              {(allocationOption.type === 'hybrid' || allocationOption.type === 'priority_artists' || allocationOption.type === 'priority_characteristics') && (
                <div className="pt-4 border-t">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    {allocationOption.type === 'hybrid' ? 'Split Allocation' : 'Remainder Split'}: {allocationOption.hybridSplit}% User-Centric / {100 - allocationOption.hybridSplit}% Pooled
                  </label>
                  <div className="relative px-4 py-4">
                    <img
                      src="/arrow_green_slider.png"
                      alt="Bidirectional slider"
                      className="absolute inset-x-4 top-1/2 -translate-y-1/2 w-[calc(100%-2rem)] h-10 object-contain pointer-events-none"
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={allocationOption.hybridSplit}
                      onChange={(e) => setAllocationOption({ ...allocationOption, hybridSplit: parseInt(e.target.value) })}
                      className="relative w-full h-2 bg-transparent appearance-none cursor-pointer z-10"
                      style={{
                        WebkitAppearance: 'none',
                        background: 'transparent'
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 mt-1 px-4">
                    <span>0% UC</span>
                    <span>25% UC</span>
                    <span>50% UC</span>
                    <span>75% UC</span>
                    <span>100% UC</span>
                  </div>
                </div>
              )}

              {allocationOption.type === 'priority_characteristics' && (
                <div className="pt-4 border-t space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">Select Priority Characteristics</h3>
                    {(() => {
                      const hasSelections = Object.values(allocationOption.priorityCharacteristics || {}).some(v => v.length > 0);
                      if (!hasSelections) return <span className="text-sm text-slate-500">No characteristics selected</span>;

                      const matchCount = artistStats.filter(artist => {
                        const chars = allocationOption.priorityCharacteristics || {};
                        const withValues = Object.entries(chars).filter(([_, vals]) => vals.length > 0);
                        if (withValues.length === 0) return false;
                        return withValues.every(([char, vals]) =>
                          artist.songs.some(song => vals.includes((song as any)[char]))
                        );
                      }).length;

                      return <span className="text-sm font-medium text-emerald-600">{matchCount} of {artistStats.length} artists match</span>;
                    })()}
                  </div>
                  {Object.entries(characteristicOptions).map(([characteristic, values]) => (
                    <div key={characteristic}>
                      <label className="block text-sm font-medium text-slate-700 mb-2 capitalize">
                        {characteristic.replace('_', ' ')}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {values.map(value => {
                          const isSelected = (allocationOption.priorityCharacteristics?.[characteristic] || []).includes(value);
                          return (
                            <button
                              key={value}
                              onClick={() => toggleCharacteristic(characteristic, value)}
                              className={`px-3 py-1 rounded-full text-sm transition-all ${
                                isSelected
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {artistStats.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <div className="text-slate-400 mb-3">
                  <Play className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Listening History</h3>
                <p className="text-slate-600">This listener hasn't played any songs yet. Start listening to see how your subscription would be allocated to artists.</p>
              </div>
            )}

            {results && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-bold text-slate-900">Listener's Monthly Payout Breakdown</h2>
                  {allocationOption.type === 'priority_artists' || allocationOption.type === 'priority_characteristics' ? (
                    <div className="mt-2 text-sm text-slate-600">
                      <div>Priority Payout: <span className="font-semibold text-emerald-600">${results.priorityPayout.toFixed(4)}</span></div>
                      <div>Remainder Payout: <span className="font-semibold text-blue-600">${results.remainderPayout.toFixed(4)}</span></div>
                    </div>
                  ) : null}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        {allocationOption.type === 'priority_artists' && (
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                            PRIORITY
                          </th>
                        )}
                        <th
                          onClick={() => handleSort('artist_name')}
                          className="px-4 py-3 text-left text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-200 select-none transition-colors border-l border-slate-200"
                        >
                          ARTIST {sortColumn === 'artist_name' ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ' ⇅'}
                        </th>
                        <th
                          onClick={() => handleSort('listener_plays')}
                          className="px-4 py-3 text-right text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-200 select-none transition-colors border-l border-slate-200"
                        >
                          YOUR PLAYS {sortColumn === 'listener_plays' ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ' ⇅'}
                        </th>
                        <th
                          onClick={() => handleSort('total_platform_plays')}
                          className="px-4 py-3 text-right text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-200 select-none transition-colors border-l border-slate-200"
                        >
                          PLATFORM PLAYS {sortColumn === 'total_platform_plays' ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ' ⇅'}
                        </th>
                        <th
                          onClick={() => handleSort('pct_listener_plays')}
                          className="px-4 py-3 text-right text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-200 select-none transition-colors border-l border-slate-200"
                        >
                          % YOUR PLAYS {sortColumn === 'pct_listener_plays' ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ' ⇅'}
                        </th>
                        <th
                          onClick={() => handleSort('pct_platform_plays')}
                          className="px-4 py-3 text-right text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-200 select-none transition-colors border-l border-slate-200"
                        >
                          % PLATFORM PLAYS {sortColumn === 'pct_platform_plays' ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ' ⇅'}
                        </th>
                        <th
                          onClick={() => handleSort('user_centric_payout')}
                          className="px-4 py-3 text-right text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-200 select-none transition-colors border-l border-slate-200"
                        >
                          $ USER-CENTRIC {sortColumn === 'user_centric_payout' ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ' ⇅'}
                        </th>
                        <th
                          onClick={() => handleSort('pooled_payout')}
                          className="px-4 py-3 text-right text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-200 select-none transition-colors border-l border-slate-200"
                        >
                          $ POOLED {sortColumn === 'pooled_payout' ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ' ⇅'}
                        </th>
                        <th
                          onClick={() => handleSort('total_payout')}
                          className="px-4 py-3 text-right text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-200 select-none transition-colors border-l border-slate-200"
                        >
                          TOTAL $ {sortColumn === 'total_payout' ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ' ⇅'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {sortedPayouts.map(payout => (
                        <tr key={payout.artist_id} className={`hover:bg-slate-50 ${payout.is_priority ? 'bg-emerald-50' : ''}`}>
                          {allocationOption.type === 'priority_artists' && (
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={allocationOption.priorityArtistIds?.includes(payout.artist_id)}
                                onChange={() => togglePriorityArtist(payout.artist_id)}
                                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                              />
                            </td>
                          )}
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">
                            {payout.artist_name}
                            {payout.is_priority && <span className="ml-2 text-xs text-emerald-600 font-semibold">PRIORITY</span>}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-slate-700">{payout.listener_plays.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-right text-slate-700">{payout.total_platform_plays.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-right text-slate-700">
                            {isFinite(payout.pct_listener_plays) ? (payout.pct_listener_plays * 100).toFixed(2) : '0.00'}%
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-slate-700">
                            {isFinite(payout.pct_platform_plays) ? (payout.pct_platform_plays * 100).toFixed(4) : '0.0000'}%
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-slate-700">${payout.user_centric_payout.toFixed(4)}</td>
                          <td className="px-4 py-3 text-sm text-right text-slate-700">${payout.pooled_payout.toFixed(4)}</td>
                          <td className="px-4 py-3 text-sm text-right font-semibold text-slate-900">${payout.total_payout.toFixed(4)}</td>
                        </tr>
                      ))}
                      {(() => {
                        const totalPlatformPlaysForListened = sortedPayouts.reduce((sum, p) => sum + p.total_platform_plays, 0);
                        const totalPctPlatformPlays = sortedPayouts.reduce((sum, p) => sum + p.pct_platform_plays, 0);
                        const totalUserCentric = sortedPayouts.reduce((sum, p) => sum + p.user_centric_payout, 0);
                        const totalPooled = sortedPayouts.reduce((sum, p) => sum + p.pooled_payout, 0);
                        const totalPayoutToListened = sortedPayouts.reduce((sum, p) => sum + p.total_payout, 0);

                        return (
                          <>
                            <tr className="bg-slate-100 font-semibold">
                              <td colSpan={allocationOption.type === 'priority_artists' ? 2 : 1} className="px-4 py-3 text-xs text-slate-700">
                                Songs NOT Streamed by Listener
                              </td>
                              <td className="px-4 py-3 text-xs text-right text-slate-700">{(totalPlatformPlays - totalListenerPlays).toLocaleString()}</td>
                              <td className="px-4 py-3 text-xs text-right text-slate-700"></td>
                              <td className="px-4 py-3 text-xs text-right text-slate-700"></td>
                              <td className="px-4 py-3 text-xs text-right text-slate-700"></td>
                              <td className="px-4 py-3 text-xs text-right text-slate-700"></td>
                              <td className="px-4 py-3 text-xs text-right font-bold text-red-600">${results.totalToOtherArtists.toFixed(4)}</td>
                              <td className="px-4 py-3 text-xs text-right font-bold text-red-600">${results.totalToOtherArtists.toFixed(4)}</td>
                            </tr>
                            <tr className="bg-emerald-50 font-bold">
                              <td colSpan={allocationOption.type === 'priority_artists' ? 2 : 1} className="px-4 py-4 text-sm text-slate-900">
                                TOTAL
                              </td>
                              <td className="px-4 py-4 text-sm text-right text-slate-900">{totalListenerPlays.toLocaleString()}</td>
                              <td className="px-4 py-4 text-sm text-right text-slate-900"></td>
                              <td className="px-4 py-4 text-sm text-right text-slate-900"></td>
                              <td className="px-4 py-4 text-sm text-right text-slate-900"></td>
                              <td className="px-4 py-4 text-sm text-right text-slate-900">${totalUserCentric.toFixed(4)}</td>
                              <td className="px-4 py-4 text-sm text-right text-slate-900">${(totalPooled + results.totalToOtherArtists).toFixed(4)}</td>
                              <td className="px-4 py-4 text-sm text-right text-emerald-700">${results.subscriptionFee.toFixed(2)}</td>
                            </tr>
                          </>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
