import { User } from 'lucide-react';
import type { Listener } from '../lib/types';

interface Props {
  listeners: Listener[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function ListenerSelector({ listeners, selectedId, onSelect }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <User className="text-blue-600 mr-2" size={24} />
        <h2 className="text-xl font-semibold text-gray-900">Select Listener</h2>
      </div>
      <select
        value={selectedId}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
      >
        {listeners.map((listener) => (
          <option key={listener.id} value={listener.id}>
            {listener.username} ({listener.email})
          </option>
        ))}
      </select>
    </div>
  );
}
