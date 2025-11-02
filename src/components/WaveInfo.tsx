// components/WaveInfo.tsx
'use client';

import { useState } from 'react';
import {
  AlertTriangleIcon,
  CloseIcon,
  ErrorIcon,
  LocationIcon,
  RefreshIcon,
  SignalIcon,
  SwimmerIcon,
  WaveIcon,
} from './icons';

interface Props {
  coords: { lat: number; lng: number } | null;
  isVisible: boolean;
  onClose: () => void;
}

/** Shape of the data returned by the wave-data API */
interface WaveData {
  timestamp: string;
  location: {
    lat: number;
    lon: number;
  };
  waveHeight: number;
  waveDirection: number;
  wavePeriod: number;
  swellHeight?: number;
  swellDirection?: number;
  swellPeriod?: number;
  // add other fields if necessary
}

/** Shape of the API’s JSON response wrapper */
interface WaveApiResult {
  success: boolean;
  error?: string;
  data?: WaveData;
  message?: string;
}

export default function WaveInfo({ coords, isVisible, onClose }: Props) {
  const [waveData, setWaveData] = useState<WaveData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('');

  const fetchWaveData = async () => {
    if (!coords) return;

    setLoading(true);
    setError(null);
    setWaveData(null);

    try {
      const response = await fetch(
        `/api/wave-data?lat=${coords.lat}&lon=${coords.lng}`
      );
      const result: WaveApiResult = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch wave data');
      }

      if (result.data) {
        setWaveData(result.data);
        setDataSource(result.message || 'Wave data retrieved');
      }
    } catch (err) {
      console.error('Wave data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch wave data');
    } finally {
      setLoading(false);
    }
  };

  const getWaveConditionLabel = (height: number) => {
    if (height < 0.5)
      return { label: 'Calm', color: 'text-green-700 bg-green-100', Icon: WaveIcon };
    if (height < 1.0)
      return { label: 'Small', color: 'text-blue-700 bg-blue-100', Icon: WaveIcon };
    if (height < 2.0)
      return { label: 'Moderate', color: 'text-yellow-700 bg-yellow-100', Icon: WaveIcon };
    if (height < 3.0)
      return { label: 'Large', color: 'text-orange-700 bg-orange-100', Icon: WaveIcon };
    return { label: 'Very Large', color: 'text-red-700 bg-red-100', Icon: AlertTriangleIcon };
  };

  const getDirectionName = (degrees: number) => {
    const directions = [
      'North',
      'Northeast',
      'East',
      'Southeast',
      'South',
      'Southwest',
      'West',
      'Northwest',
    ];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  const getSwimmingSuitability = (waveHeight: number) => {
    if (waveHeight < 0.3) {
      return {
        label: 'Excellent for Swimming',
        color: 'text-green-700 bg-green-50 border-green-200',
        advice: 'Perfect calm conditions for all swimming activities',
      };
    } else if (waveHeight < 0.8) {
      return {
        label: 'Good for Swimming',
        color: 'text-blue-700 bg-blue-50 border-blue-200',
        advice: 'Light waves, suitable for most swimmers',
      };
    } else if (waveHeight < 1.5) {
      return {
        label: 'Moderate - Caution Advised',
        color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
        advice: 'Suitable for experienced swimmers, watch for stronger currents',
      };
    } else if (waveHeight < 2.5) {
      return {
        label: 'Challenging Conditions',
        color: 'text-orange-700 bg-orange-50 border-orange-200',
        advice: 'Only for strong, experienced swimmers. Stay close to shore',
      };
    } else {
      return {
        label: 'Not Recommended',
        color: 'text-red-700 bg-red-50 border-red-200',
        advice: 'Dangerous conditions - avoid swimming',
      };
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="overlay-fade fixed inset-0 backdrop-blur-[1px] flex items-center justify-center z-[9999] p-4"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
    >
      <div className="modal-pop bg-white rounded-lg shadow-xl w-full max-w-md h-[600px] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <WaveIcon size={20} className="text-blue-600" />
            <span>Wave Information</span>
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close wave information"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Initial state - not loading, no data, no error */}
          {!waveData && !loading && !error && (
            <div className="text-center py-8">
              <div className="mb-4 flex flex-col items-center">
                <WaveIcon size={56} className="text-blue-500 mb-3" />
                <p className="text-gray-600 mb-4">
                  Get current wave conditions and marine weather data for this location
                </p>
              </div>
              <button
                onClick={fetchWaveData}
                disabled={!coords}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {coords ? 'Fetch Wave Data' : 'Select a location first'}
              </button>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Fetching wave data...</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <ErrorIcon size={18} className="text-red-600" />
                <span className="text-red-700 font-medium">Error</span>
              </div>
              <p className="text-red-700 text-sm">{error}</p>
              <button
                type="button"
                onClick={fetchWaveData}
                className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center gap-2 w-max"
              >
                <RefreshIcon size={16} className="text-white" />
                <span>Try Again</span>
              </button>
            </div>
          )}

          {/* Wave data display */}
          {waveData && (
            <div className="space-y-4">
              {/* Data source info */}
              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <SignalIcon size={16} className="text-gray-500" />
                  <span>{dataSource}</span>
                </div>
                <span className="text-gray-500">
                  Updated: {new Date(waveData.timestamp).toLocaleTimeString()}
                </span>
              </div>

              {/* Location info */}
              <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded flex items-center gap-2">
                <LocationIcon size={18} className="text-blue-600" />
                <span>
                  Location: {waveData.location.lat.toFixed(4)}°, {waveData.location.lon.toFixed(4)}°
                </span>
              </div>

              {/* Wave height */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Wave Conditions</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Wave Height:</span>
                    <div className="text-right">
                      <div className="font-medium text-lg">{waveData.waveHeight.toFixed(2)} m</div>
                      <div className="text-sm text-gray-500">
                        ({(waveData.waveHeight * 3.28).toFixed(1)} ft)
                      </div>
                    </div>
                  </div>

                  {waveData.waveHeight > 0 && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Wave Direction:</span>
                        <div className="text-right">
                          <div className="font-medium">{waveData.waveDirection}°</div>
                          <div className="text-sm text-gray-500">
                            {getDirectionName(waveData.waveDirection)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Wave Period:</span>
                        <div className="font-medium">{waveData.wavePeriod.toFixed(1)} sec</div>
                      </div>
                    </>
                  )}

                  {/* Wave condition badge */}
                  {(() => {
                    const condition = getWaveConditionLabel(waveData.waveHeight);
                    const ConditionIcon = condition.Icon;
                    return (
                      <div className={`${condition.color} px-3 py-2 rounded-lg text-sm font-medium text-center flex items-center justify-center gap-2`}>
                        <ConditionIcon size={18} />
                        <span>{condition.label} Waves</span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Swell information (if available) */}
              {waveData.swellHeight !== undefined && waveData.swellHeight > 0 && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Swell Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Swell Height:</span>
                      <span className="font-medium">{waveData.swellHeight!.toFixed(2)} m</span>
                    </div>
                    {waveData.swellDirection !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Swell Direction:</span>
                        <span className="font-medium">
                          {getDirectionName(waveData.swellDirection!)}
                        </span>
                      </div>
                    )}
                    {waveData.swellPeriod !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Swell Period:</span>
                        <span className="font-medium">
                          {waveData.swellPeriod!.toFixed(1)} sec
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Swimming suitability */}
              {(() => {
                const suitability = getSwimmingSuitability(waveData.waveHeight);
                return (
                  <div className={`border rounded-lg p-4 ${suitability.color}`}>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <SwimmerIcon size={18} className="text-blue-600" />
                      <span>Swimming Assessment</span>
                    </h3>
                    <div className="font-medium mb-1">{suitability.label}</div>
                    <p className="text-sm">{suitability.advice}</p>
                  </div>
                );
              })()}

              {/* Refresh button */}
              <button
                onClick={fetchWaveData}
                disabled={loading}
                className="w-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  'Refreshing...'
                ) : (
                  <>
                    <RefreshIcon size={18} className="text-gray-600" />
                    <span>Refresh Wave Data</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
