import { DollarSign, Star, ArrowUpDown } from 'lucide-react';
import { useState, useMemo } from 'react';
import type { ArtistPayout } from '../lib/types';

interface Props {
  payouts: ArtistPayout[];
  onTogglePriority: (artistId: string) => void;
}

type SortDirection = 'asc' | 'desc' | null;

export function PayoutTable({ payouts, onTogglePriority }: Props) {
  const [prioritySort, setPrioritySort] = useState<SortDirection>(null);

  const sortedPayouts = useMemo(() => {
    if (!prioritySort) return payouts;

    return [...payouts].sort((a, b) => {
      const aValue = a.is_priority ? 1 : 0;
      const bValue = b.is_priority ? 1 : 0;

      if (prioritySort === 'desc') {
        return bValue - aValue;
      }
      return aValue - bValue;
    });
  }, [payouts, prioritySort]);

  const handlePrioritySort = () => {
    if (prioritySort === null) {
      setPrioritySort('desc');
    } else if (prioritySort === 'desc') {
      setPrioritySort('asc');
    } else {
      setPrioritySort(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <DollarSign className="text-blue-600 mr-2" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">Artist Payouts</h2>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                <button
                  onClick={handlePrioritySort}
                  className="flex items-center gap-1 hover:text-gray-700 transition-colors cursor-pointer select-none"
                  title="Sort by priority"
                >
                  Priority
                  <ArrowUpDown size={14} className={prioritySort ? 'text-blue-600' : 'text-gray-400'} />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Artist</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Your Plays</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Platform Plays</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Payout</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedPayouts.map((payout) => (
              <tr key={payout.artist_id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <button
                    onClick={() => onTogglePriority(payout.artist_id)}
                    className={`p-1 rounded ${
                      payout.is_priority
                        ? 'text-yellow-500 hover:text-yellow-600'
                        : 'text-gray-300 hover:text-gray-400'
                    }`}
                    title={payout.is_priority ? 'Remove from priority' : 'Add to priority'}
                  >
                    <Star size={20} fill={payout.is_priority ? 'currentColor' : 'none'} />
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{payout.artist_name}</div>
                  {payout.is_priority && (
                    <div className="text-xs text-yellow-600 font-medium">Priority Artist</div>
                  )}
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">
                  {payout.plays_by_listener.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">
                  {payout.total_platform_plays.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    ${payout.hybrid_payout.toFixed(4)}
                  </div>
                  <div className="text-xs text-gray-500">
                    UC: ${payout.user_centric_payout.toFixed(4)} | P: ${payout.pooled_payout.toFixed(4)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
