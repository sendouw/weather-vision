// src/pages/index.tsx
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import SearchBar from '@/components/SearchBar';
import InfoPanel, { PlaceInfo } from '@/components/infoPanel';
import { OpenMeteoResponse } from '@/components/Map';

const WeatherMap = dynamic(() => import('@/components/Map'), { ssr: false });

interface Favorite {
  name: string;
  coords: { lat: number; lng: number };
  addedAt?: string;
}

export default function Home() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  // Replace {} with Record<string, unknown>
  const [weatherData, setWeatherData] = useState<OpenMeteoResponse | Record<string, unknown>>(
    {} as Record<string, unknown>
  );
  const [placeId, setPlaceId] = useState<string | null>(null);
  // Replace {} with Record<string, unknown>
  const [placeInfo, setPlaceInfo] = useState<PlaceInfo | Record<string, unknown>>({} as Record<string, unknown>);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationFallback, setLocationFallback] = useState(false);
  const [forecastIndex, setForecastIndex] = useState<number>(0);
  const [showSidebar, setShowSidebar] = useState(true);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('weathervision-favorites');
      if (stored) {
        const parsedFavorites = JSON.parse(stored) as Favorite[];
        setFavorites(Array.isArray(parsedFavorites) ? parsedFavorites : []);
      }
    } catch (err) {
      console.warn('Failed to load favorites from localStorage:', err);
      setFavorites([]);
    }
  }, []);

  const addFavorite = (fav: { name: string; coords: { lat: number; lng: number } }) => {
    try {
      const newFavorite: Favorite = {
        name: fav.name,
        coords: fav.coords,
        addedAt: new Date().toISOString(),
      };

      const newFavorites = [...favorites, newFavorite].filter(
        (item, i, self) =>
          i ===
          self.findIndex(
            (t) =>
              t.name === item.name &&
              Math.abs(t.coords.lat - item.coords.lat) < 0.0001 &&
              Math.abs(t.coords.lng - item.coords.lng) < 0.0001
          )
      );

      setFavorites(newFavorites);
      localStorage.setItem('weathervision-favorites', JSON.stringify(newFavorites));

      // Show success message
      setError(`✅ Added "${fav.name}" to favorites!`);
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error('Failed to save favorite:', err);
      setError('Failed to save favorite location');
      setTimeout(() => setError(null), 3000);
    }
  };

  const removeFavorite = (index: number) => {
    try {
      const newFavorites = favorites.filter((_, i) => i !== index);
      setFavorites(newFavorites);
      localStorage.setItem('weathervision-favorites', JSON.stringify(newFavorites));
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    }
  };

  const selectFavorite = (favorite: Favorite) => {
    setCoords(favorite.coords);
    setLocationName(favorite.name);
    setPlaceId(null);
    setPlaceInfo({} as Record<string, unknown>);
    fetchWeatherAndSwimScore(favorite.coords.lat, favorite.coords.lng);
    setShowFavorites(false);
  };

  // Fetch place details when placeId changes
  useEffect(() => {
    if (!placeId) return;

    const fetchPlaceDetails = async () => {
      try {
        const res = await fetch(`/api/place-details?placeId=${placeId}`);
        if (res.ok) {
          const data = (await res.json()) as PlaceInfo;
          setPlaceInfo(data);
        }
      } catch (err) {
        console.warn('Failed to fetch place details:', err);
      }
    };

    fetchPlaceDetails();
  }, [placeId]);

  const fetchWeatherAndSwimScore = async (lat: number, lng: number) => {
    try {
      setError(null);
      const res = await fetch(`/api/OpenMateo?lat=${lat}&lon=${lng}`);

      if (!res.ok) {
        throw new Error(`Weather API error: ${res.status}`);
      }

      const data = (await res.json()) as OpenMeteoResponse;
      setWeatherData(data);
    } catch (err) {
      console.error('Weather fetch failed:', err);
      setError('Failed to fetch weather data. Please try again.');
      setWeatherData({} as Record<string, unknown>);
    }
  };

  // Initialize location on mount
  useEffect(() => {
    const initializeLocation = () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            setCoords({ lat: latitude, lng: longitude });
            fetchWeatherAndSwimScore(latitude, longitude);
            setLocationName('Your Current Location');
            setLoading(false);
          },
          (error) => {
            console.warn('Geolocation failed:', error);
            const fallback = { lat: 7.5413, lng: 99.0955 }; // Koh Lanta, Thailand
            setCoords(fallback);
            fetchWeatherAndSwimScore(fallback.lat, fallback.lng);
            setLocationName('Koh Lanta, Thailand');
            setLocationFallback(true);
            setLoading(false);
          }
        );
      } else {
        const fallback = { lat: 7.5413, lng: 99.0955 };
        setCoords(fallback);
        fetchWeatherAndSwimScore(fallback.lat, fallback.lng);
        setLocationName('Koh Lanta, Thailand');
        setLocationFallback(true);
        setLoading(false);
      }
    };

    initializeLocation();
  }, []);

  const formatDate = (hoursAhead: number) => {
    const date = new Date();
    date.setHours(date.getHours() + hoursAhead);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      hour: 'numeric',
      hour12: true,
    });
  };

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 relative">
      <div className="w-full max-w-screen-xl mx-auto px-4 md:px-8 pb-24">
        {/* Header */}
        <div className="text-center pt-8 pb-6">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent z-10 relative">
            Weather Vision 🌤
          </h1>
          <p className="mt-3 text-gray-700 text-lg max-w-2xl mx-auto leading-relaxed">
            Discover perfect swimming conditions anywhere in the world. Get real-time weather analysis{' '}
            and swim scores to plan your ideal beach day.
          </p>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6 z-50 relative">
          <div className="flex-1 w-full lg:max-w-md">
            <SearchBar
              onPlaceSelected={(p: {
                lat: number;
                lng: number;
                name: string;
                placeId: string;
              }) => {
                const { lat, lng, name, placeId } = p;
                setCoords({ lat, lng });
                setLocationName(name);
                setPlaceId(placeId);
                fetchWeatherAndSwimScore(lat, lng);
                setLocationFallback(false);
              }}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm text-black"
            >
              ❤️ Favorites ({favorites.length})
            </button>

            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-black"
            >
              {showSidebar ? '⇤ Hide Panel' : '⇥ Show Panel'}
            </button>
          </div>
        </div>

        {/* Error Messages */}
        {error && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              error.startsWith('✅')
                ? 'bg-green-100 border border-green-300 text-green-800'
                : 'bg-red-100 border border-red-300 text-red-800'
            }`}
          >
            {error}
          </div>
        )}

        {/* Location Fallback Warning */}
        {locationFallback && (
          <div className="relative text-center bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-lg p-3 mb-4 max-w-screen-md mx-auto">
            ⚠️ Location access not available. Showing Koh Lanta, Thailand as example.
            <button
              onClick={() => setLocationFallback(false)}
              className="absolute right-3 top-2 text-yellow-700 hover:text-yellow-900 font-bold text-lg"
              aria-label="Dismiss fallback message"
            >
              ×
            </button>
          </div>
        )}

        {/* Favorites Dropdown */}
        {showFavorites && (
          <div className="mb-4 bg-white rounded-lg shadow-lg border p-4 z-40 relative">
            <h3 className="font-semibold mb-3 text-gray-800">Your Favorite Locations</h3>
            {favorites.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No favorite locations saved yet. Click the ❤️ button on any location to save it!
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {favorites.map((fav, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded border"
                  >
                    <button onClick={() => selectFavorite(fav)} className="flex-1 text-left">
                      <div className="font-medium text-gray-800">{fav.name}</div>
                      <div className="text-xs text-gray-500">
                        {fav.coords.lat.toFixed(4)}, {fav.coords.lng.toFixed(4)}
                      </div>
                    </button>
                    <button
                      onClick={() => removeFavorite(index)}
                      className="ml-2 text-red-500 hover:text-red-700 p-1"
                      title="Remove from favorites"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

{/* Main Content */}
<div className="flex flex-col lg:flex-row gap-6">
  {/* Map */}
  <div
    className={`transition-all duration-300 ${
      showSidebar ? 'lg:w-1/2' : 'w-full'
    } h-[70vh] lg:h-[80vh] flex-shrink-0`}
  >
    {coords ? (
      // ← add “h-full” here so WeatherMap fills that 70vh/80vh wrapper
      <div className="h-full">
        <WeatherMap
          coords={coords}
          onWeatherFetched={setWeatherData}
          triggerSwimScore={true}
        />
      </div>
    ) : (
      <div className="flex h-full items-center justify-center">
        <p>Loading map…</p>
      </div>
    )}
  </div>

          {/* Info Panel */}
          {showSidebar && (
            <div className="lg:w-1/2 space-y-4">
              {/* Forecast Time Selector */}
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forecast Time
                </label>
                <select
                  value={forecastIndex}
                  onChange={(e) => setForecastIndex(Number(e.target.value))}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 p-2"
                >
                  <option value={0}>Now - {formatDate(0)}</option>
                  <option value={1}>1 Hour - {formatDate(1)}</option>
                  <option value={6}>6 Hours - {formatDate(6)}</option>
                  <option value={12}>12 Hours - {formatDate(12)}</option>
                  <option value={24}>24 Hours - {formatDate(24)}</option>
                </select>
              </div>

              {/* Info Panel */}
              <div className="h-[calc(80vh-120px)] overflow-hidden">
                {loading ? (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-6 bg-gray-300 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                      <div className="h-32 bg-gray-200 rounded" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ) : (
                  <InfoPanel
                    coords={coords}
                    data={weatherData}
                    placeName={locationName}
                    placeInfo={placeInfo}
                    forecastIndex={forecastIndex}
                    onSaveFavorite={addFavorite}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-gray-500 p-4 space-y-2">
          <p className="font-medium">Created by Andy Sendouw</p>
          <div className="flex flex-wrap justify-center gap-1 text-xs">
            <span>Weather data ©</span>
            
            <a  className="underline hover:text-gray-700"
              href="https://open-meteo.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open-Meteo
            </a>
            <span>• Satellite imagery ©</span>
            
            <a  className="underline hover:text-gray-700"
              href="https://earthdata.nasa.gov/gibs"
              target="_blank"
              rel="noopener noreferrer"
            >
              NASA GIBS
            </a>
            <span>• Map tiles ©</span>
            
            <a  className="underline hover:text-gray-700"
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
            >
              OpenStreetMap
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}