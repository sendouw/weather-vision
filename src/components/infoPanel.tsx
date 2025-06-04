// src/components/infoPanel.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import WaveInfo from './WaveInfo';
import SwimScoreInfoModal from './SwimScoreInfoModal';

interface PlacePhoto {
  photo_reference: string;
}
interface PlaceReview {
  author_name: string;
  text: string;
}
export interface PlaceInfo {
  photos?: PlacePhoto[];
  reviews?: PlaceReview[];
  // (add any other fields you actually use)
}

// Shape of the `data` prop when hourly is present
interface HourlyData {
  hourly: {
    windspeed_10m?: number[];
    windgusts_10m?: number[];
    winddirection_10m?: number[];
    weathercode?: number[];
    precipitation?: number[];
    precipitation_sum?: number[];
    visibility?: number[];
    pm10?: number[];
    uv_index?: number[];
    cloudcover?: number[];
    apparent_temperature?: number[];
    sea_surface_temperature?: number[];
    temperature_2m?: number[];
  };
}

// Union of either having no hourly or having HourlyData
// Replace "{}" with "Record<string, unknown>"
type WeatherData = HourlyData | Record<string, unknown>;

// Result shape from the `/api/swimscore` endpoint
interface SwimScoreResult {
  totalScore: number;
  breakdown: { safety: number; comfort: number; performance: number };
  explanation: string[];
}

interface Props {
  coords: { lat: number; lng: number } | null;
  data: WeatherData;
  placeName: string | null;
  placeInfo: PlaceInfo;
  forecastIndex: number;
  onSaveFavorite?: (fav: { name: string; coords: { lat: number; lng: number } }) => void;
}

export default function InfoPanel({
  coords,
  data,
  placeName,
  placeInfo,
  forecastIndex,
  onSaveFavorite,
}: Props) {
  const [swimScore, setSwimScore] = useState<SwimScoreResult | null>(null);
  const [showWaveInfo, setShowWaveInfo] = useState(false);
  const [showSwimScoreInfo, setShowSwimScoreInfo] = useState(false);

  // Type guard: checks if data has an 'hourly' property
  const hasHourly = (d: WeatherData): d is HourlyData =>
    typeof d === 'object' && d !== null && 'hourly' in d && !!d.hourly;

  // Helper to fetch swim score from our API
  const fetchSwimScore = useCallback(async () => {
    if (!coords || !hasHourly(data)) {
      setSwimScore(null);
      return;
    }

    const {
      windspeed_10m = [],
      windgusts_10m = [],
      winddirection_10m = [],
      weathercode = [],
      precipitation = [],
      precipitation_sum = [],
      visibility = [],
      pm10 = [],
      uv_index = [],
      cloudcover = [],
      apparent_temperature = [],
      sea_surface_temperature = [],
    } = data.hourly;

    const inputs = {
      windSpeed: windspeed_10m[forecastIndex] ?? 0,
      windGust: windgusts_10m[forecastIndex] ?? 0,
      windDirection: winddirection_10m[forecastIndex] ?? 0,
      weatherCode: String(weathercode[forecastIndex] ?? 0),
      precipAmount: precipitation[forecastIndex] ?? 0,
      precipLast24h: precipitation_sum[forecastIndex] ?? 0,
      visibility: visibility[forecastIndex] ?? 10000,
      airQualityIndex: pm10[forecastIndex] ?? 0,
      uvIndex: uv_index[forecastIndex] ?? 0,
      cloudCover: cloudcover[forecastIndex] ?? 0,
      apparentTemp: apparent_temperature[forecastIndex] ?? 0,
      sst: sea_surface_temperature[forecastIndex] ?? 27,
    };

    try {
      const res = await fetch('/api/swimscore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs),
      });
      if (!res.ok) throw new Error(`SwimScore API error: ${res.status}`);
      const result: SwimScoreResult = await res.json();
      setSwimScore(result);
    } catch (err) {
      console.error('SwimScore fetch error:', err);
      setSwimScore(null);
    }
  }, [coords, data, forecastIndex]);

  // Run fetchSwimScore whenever data/coords/forecastIndex change
  useEffect(() => {
    fetchSwimScore();
  }, [fetchSwimScore]);

  if (!coords) {
    return <div className="text-gray-500">Select a beach to view info</div>;
  }

  // Only access data.hourly if hasHourly(data) returns true
  let cloudVal: number | null = null,
    rainVal: number | null = null,
    tempVal: number | null = null;

  if (hasHourly(data)) {
    cloudVal = data.hourly.cloudcover?.[forecastIndex] ?? null;
    rainVal = data.hourly.precipitation?.[forecastIndex] ?? null;
    tempVal = data.hourly.temperature_2m?.[forecastIndex] ?? null;
  }

  const hasWeather = cloudVal !== null && rainVal !== null && tempVal !== null;

  // Derive a quick "label"+color for the panel header
  let scoreLabel = 'N/A';
  let color = 'bg-gray-100 text-gray-600';
  if (hasWeather) {
    scoreLabel = 'Perfect ☀️';
    color = 'bg-green-100 text-green-800';
    if (rainVal! > 1 || cloudVal! > 70 || tempVal! < 25) {
      scoreLabel = 'Not Ideal 🧥';
      color = 'bg-red-100 text-red-700';
    } else if (cloudVal! > 30) {
      scoreLabel = 'Decent ☁️';
      color = 'bg-yellow-100 text-yellow-800';
    }
  }

  const photos = placeInfo.photos ?? [];
  const reviews = placeInfo.reviews ?? [];

  return (
    <>
      {/* Info Panel Container */}
      <div className="bg-white rounded shadow p-4 space-y-4 text-black">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{placeName}</h2>
          <button
            onClick={() =>
              onSaveFavorite?.({
                name: placeName || 'Unknown',
                coords,
              })
            }
            title="Save to Favorites"
            className="text-red-500 hover:text-red-600 text-xl"
          >
            ❤️
          </button>
        </div>

        {!hasWeather && (
          <div className="text-red-600 bg-red-50 p-2 rounded text-sm border border-red-200">
            ⚠️ Unable to fetch complete weather data from Open-Meteo. Showing fallback values.
          </div>
        )}

        <div className={`${color} p-2 rounded text-center font-medium`}>
          Swim Score: {scoreLabel}
        </div>

        {/* Wave Info Button */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowWaveInfo(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            🌊 Wave Info
          </button>
        </div>

        {/* If swimScore is still loading or null */}
        {!swimScore && (
          <div className="bg-yellow-50 p-2 rounded text-sm border border-yellow-200">
            ⏳ Loading swim score data...
          </div>
        )}

        {swimScore && (
          <div className="bg-blue-50 p-3 rounded border border-blue-200 text-sm">
            <div className="flex items-center justify-between mb-1">
              <p>
                🏊 Total:{' '}
                <span className="font-semibold">{swimScore.totalScore}/100</span>
              </p>
              <button
                onClick={() => setShowSwimScoreInfo(true)}
                title="How is this calculated?"
                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
              >
                ℹ️ Info
              </button>
            </div>
            <ul className="mt-1 ml-2 list-disc list-inside">
              <li>🛟 Safety: {swimScore.breakdown.safety}</li>
              <li>😌 Comfort: {swimScore.breakdown.comfort}</li>
              <li>🏃 Performance: {swimScore.breakdown.performance}</li>
            </ul>
            <div className="mt-2 space-y-1">
              {swimScore.explanation.map((msg, i) => (
                <p key={i} className="text-xs text-gray-700">
                  • {msg}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Beach Photos */}
        {photos.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold mt-4 mb-2">📸 Beach Photos</h3>
            <div className="flex flex-wrap gap-2">
              {photos.map((photo, i) => (
                <div key={i} className="relative h-24 w-32 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
                    alt={`Photo ${i + 1}`}
                    className="object-cover rounded h-full w-full"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Beach Reviews */}
        {reviews.length > 0 && (
          <div className="space-y-2">
            <h3 className="mb-2 text-lg font-semibold">Latest Reviews</h3>
            <ul className="space-y-2">
              {reviews.map((review, i) => (
                <li key={i} className="rounded border p-2">
                  <p className="font-medium">{review.author_name}</p>
                  <p className="text-gray-700 italic">&quot;{review.text}&quot;</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Wave Info Modal */}
      <WaveInfo coords={coords} isVisible={showWaveInfo} onClose={() => setShowWaveInfo(false)} />

      {/* Swim Score Info Modal */}
      <SwimScoreInfoModal isVisible={showSwimScoreInfo} onClose={() => setShowSwimScoreInfo(false)} />
    </>
  );
}