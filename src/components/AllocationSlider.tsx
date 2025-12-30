import { Sliders, MoveHorizontal } from 'lucide-react';

interface Props {
  value: number;
  onChange: (value: number) => void;
  subscriptionFee: number;
}

export function AllocationSlider({ value, onChange, subscriptionFee }: Props) {
  const userCentricAmount = (subscriptionFee * value) / 100;
  const pooledAmount = subscriptionFee - userCentricAmount;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <Sliders className="text-blue-600 mr-2" size={24} />
        <h2 className="text-xl font-semibold text-gray-900">Distribution Model</h2>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-medium text-gray-700">
              User-Centric: {value}%
            </label>
            <span className="text-lg font-bold text-blue-600">
              ${userCentricAmount.toFixed(2)}
            </span>
          </div>
          <div className="py-2 relative">
            <div
              className="absolute w-full h-3 rounded-lg border-2 border-blue-600 overflow-hidden pointer-events-none"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
            >
              <div
                className="h-full transition-all duration-150"
                style={{
                  background: `linear-gradient(to right, #2563eb 0%, #2563eb ${value}%, #10b981 ${value}%, #10b981 100%)`
                }}
              />
            </div>
            <div
              className="absolute pointer-events-none transition-all duration-150"
              style={{
                left: `${value}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 11
              }}
            >
              <div className="bg-white border-2 border-blue-600 rounded p-1 shadow-lg">
                <MoveHorizontal className="text-blue-600" size={20} />
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              className="w-full relative appearance-none cursor-pointer bg-transparent"
              style={{ zIndex: 10 }}
            />
          </div>
          <div className="flex justify-between items-center mt-3">
            <label className="text-sm font-medium text-gray-700">
              Pooled: {100 - value}%
            </label>
            <span className="text-lg font-bold text-green-600">
              ${pooledAmount.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
          <p className="text-gray-700">
            <strong>User-Centric:</strong> Money goes only to artists you listened to, proportional to your plays
          </p>
          <p className="text-gray-700">
            <strong>Pooled:</strong> Money goes to all platform artists, proportional to their total platform plays
          </p>
        </div>
      </div>

      <style>{`
        input[type="range"]::-webkit-slider-runnable-track {
          height: 24px;
          background: transparent;
        }

        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 40px;
          height: 32px;
          background: transparent;
          cursor: grab;
        }

        input[type="range"]::-webkit-slider-thumb:active {
          cursor: grabbing;
        }

        input[type="range"]::-moz-range-track {
          height: 24px;
          background: transparent;
        }

        input[type="range"]::-moz-range-thumb {
          width: 40px;
          height: 32px;
          background: transparent;
          border: none;
          cursor: grab;
        }

        input[type="range"]::-moz-range-thumb:active {
          cursor: grabbing;
        }
      `}</style>
    </div>
  );
}
