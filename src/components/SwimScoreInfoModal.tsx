// components/SwimScoreInfoModal.tsx
'use client';

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

export default function SwimScoreInfoModal({ isVisible, onClose }: Props) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-[1px] flex items-center justify-center z-[9999] p-4" style={{backgroundColor: 'rgba(0, 0, 0, 0.1)'}}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-blue-50 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">🏊 How Swim Score is Calculated</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Overview */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">📊 Composite Score Overview</h3>
              <p className="text-blue-800 text-sm">
                The Swim Score is calculated from three key factors: Safety (50%), Comfort (30%), and Performance (20%). 
                Each factor is scored from 0-100, with the final score weighted to prioritize swimmer safety above all else.
              </p>
            </div>

            {/* Safety Section */}
            <div className="border rounded-lg p-5">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">🛟</span>
                <h3 className="text-lg font-semibold text-gray-900">Safety (50% of total score)</h3>
              </div>
              <p className="text-gray-700 mb-3">
                Safety is the most important factor. Poor safety conditions can override other positive factors.
              </p>
              
              <div className="bg-red-50 p-3 rounded border border-red-200 mb-3">
                <h4 className="font-medium text-red-900 mb-2">Critical Safety Factors:</h4>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• <strong>Thunderstorms:</strong> Automatic danger score (5/100)</li>
                  <li>• <strong>Extreme winds:</strong> 40+ km/h creates hazardous waves</li>
                  <li>• <strong>Water temperature:</strong> Below 15°C risks hypothermia</li>
                </ul>
              </div>

              <h4 className="font-medium text-gray-900 mb-2">What affects safety score:</h4>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div>
                  <h5 className="font-medium text-gray-800">Wind Conditions</h5>
                  <ul className="text-gray-600 ml-2">
                    <li>• 30+ km/h: -20 points</li>
                    <li>• 25-30 km/h: -15 points</li>
                    <li>• 20-25 km/h: -10 points</li>
                    <li>• 15-20 km/h: -5 points</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-gray-800">Weather Conditions</h5>
                  <ul className="text-gray-600 ml-2">
                    <li>• Heavy rain (15+ mm): -15 points</li>
                    <li>• Moderate rain (10+ mm): -10 points</li>
                    <li>• Light rain (5+ mm): -5 points</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-gray-800">Visibility</h5>
                  <ul className="text-gray-600 ml-2">
                    <li>• Under 500m: -15 points</li>
                    <li>• Under 1km: -10 points</li>
                    <li>• Under 3km: -5 points</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-gray-800">Water Temperature</h5>
                  <ul className="text-gray-600 ml-2">
                    <li>• Under 15°C: -20 points</li>
                    <li>• 15-18°C: -15 points</li>
                    <li>• Over 32°C: -10 points</li>
                    <li>• Over 30°C: -5 points</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Comfort Section */}
            <div className="border rounded-lg p-5">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">😌</span>
                <h3 className="text-lg font-semibold text-gray-900">Comfort (30% of total score)</h3>
              </div>
              <p className="text-gray-700 mb-3">
                Comfort measures how pleasant the swimming experience will be.
              </p>

              <h4 className="font-medium text-gray-900 mb-2">What affects comfort score:</h4>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div>
                  <h5 className="font-medium text-gray-800">Air Temperature</h5>
                  <ul className="text-gray-600 ml-2">
                    <li>• 24-32°C: +5 points (ideal)</li>
                    <li>• Over 42°C: -15 points</li>
                    <li>• 38-42°C: -10 points</li>
                    <li>• 35-38°C: -5 points</li>
                    <li>• Under 18°C: -15 points</li>
                    <li>• 18-22°C: -8 points</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-gray-800">UV Index</h5>
                  <ul className="text-gray-600 ml-2">
                    <li>• 3-6: +2 points (pleasant)</li>
                    <li>• 7-8: -4 points</li>
                    <li>• 9-10: -8 points</li>
                    <li>• 11+: -12 points (extreme)</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-gray-800">Cloud Cover</h5>
                  <ul className="text-gray-600 ml-2">
                    <li>• 20-70%: +3 points (ideal)</li>
                    <li>• Over 95%: -5 points (overcast)</li>
                    <li>• Under 10%: -2 points (harsh sun)</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-gray-800">Water Temperature</h5>
                  <ul className="text-gray-600 ml-2">
                    <li>• 24-28°C: +8 points (perfect)</li>
                    <li>• 22-30°C: +3 points</li>
                    <li>• Under 20°C or over 31°C: -8 points</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Performance Section */}
            <div className="border rounded-lg p-5">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">🏃</span>
                <h3 className="text-lg font-semibold text-gray-900">Performance (20% of total score)</h3>
              </div>
              <p className="text-gray-700 mb-3">
                Performance measures conditions for efficient swimming and physical activity.
              </p>

              <h4 className="font-medium text-gray-900 mb-2">What affects performance score:</h4>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div>
                  <h5 className="font-medium text-gray-800">Wind Impact</h5>
                  <ul className="text-gray-600 ml-2">
                    <li>• Under 5 km/h: +2 points (calm)</li>
                    <li>• 10-15 km/h: -3 points</li>
                    <li>• 15-20 km/h: -5 points</li>
                    <li>• 20-25 km/h: -8 points</li>
                    <li>• Over 25 km/h: -12 points</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-gray-800">Water Temperature</h5>
                  <ul className="text-gray-600 ml-2">
                    <li>• 22-26°C: +5 points (optimal)</li>
                    <li>• 20-28°C: +2 points</li>
                    <li>• Under 18°C or over 30°C: -8 points</li>
                    <li>• 18-20°C or 28-30°C: -4 points</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-gray-800">Air Quality</h5>
                  <ul className="text-gray-600 ml-2">
                    <li>• Under 25: +2 points (excellent)</li>
                    <li>• 50-100: -2 points</li>
                    <li>• 100-150: -6 points</li>
                    <li>• Over 150: -10 points</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-gray-800">Activity Temperature</h5>
                  <ul className="text-gray-600 ml-2">
                    <li>• 26-30°C: +3 points (ideal for activity)</li>
                    <li>• Over 35°C: -6 points (too hot)</li>
                    <li>• Under 20°C: -4 points (affects performance)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Score Interpretation */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-3">🎯 Score Interpretation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="bg-green-100 p-2 rounded border border-green-200">
                  <div className="font-medium text-green-800">85-100: Perfect</div>
                  <div className="text-green-700">Ideal swimming conditions</div>
                </div>
                <div className="bg-blue-100 p-2 rounded border border-blue-200">
                  <div className="font-medium text-blue-800">70-84: Great</div>
                  <div className="text-blue-700">Excellent for swimming</div>
                </div>
                <div className="bg-yellow-100 p-2 rounded border border-yellow-200">
                  <div className="font-medium text-yellow-800">55-69: Good</div>
                  <div className="text-yellow-700">Good conditions, monitor changes</div>
                </div>
                <div className="bg-orange-100 p-2 rounded border border-orange-200">
                  <div className="font-medium text-orange-800">40-54: Fair</div>
                  <div className="text-orange-700">Caution advised, shorter swims</div>
                </div>
                <div className="bg-red-100 p-2 rounded border border-red-200">
                  <div className="font-medium text-red-800">25-39: Poor</div>
                  <div className="text-red-700">Only for experienced swimmers</div>
                </div>
                <div className="bg-red-200 p-2 rounded border border-red-300">
                  <div className="font-medium text-red-900">0-24: Dangerous</div>
                  <div className="text-red-800">Swimming not recommended</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}