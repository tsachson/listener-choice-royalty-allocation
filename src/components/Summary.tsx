import { TrendingUp, Users, DollarSign } from 'lucide-react';

interface Props {
  totalToYourArtists: number;
  totalToOtherArtists: number;
  subscriptionFee: number;
  artistCount: number;
}

export function Summary({ totalToYourArtists, totalToOtherArtists, subscriptionFee, artistCount }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">To Your Artists</p>
            <p className="text-2xl font-bold text-blue-600">
              ${totalToYourArtists.toFixed(4)}
            </p>
          </div>
          <TrendingUp className="text-blue-600" size={32} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">To Other Artists</p>
            <p className="text-2xl font-bold text-green-600">
              ${totalToOtherArtists.toFixed(4)}
            </p>
          </div>
          <Users className="text-green-600" size={32} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Artists Paid</p>
            <p className="text-2xl font-bold text-gray-900">{artistCount}</p>
            <p className="text-xs text-gray-500 mt-1">Your subscription: ${subscriptionFee.toFixed(2)}</p>
          </div>
          <DollarSign className="text-gray-900" size={32} />
        </div>
      </div>
    </div>
  );
}
