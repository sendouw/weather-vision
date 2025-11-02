// src/components/Map.tsx
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ──────────── Replace `as any` on _getIconUrl ────────────
// We cast to `unknown` first, then to an interface that only contains `_getIconUrl?: unknown`.
interface LeafletIconDefault {
  _getIconUrl?: unknown;
}
delete (L.Icon.Default.prototype as unknown as LeafletIconDefault)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: '/leaflet/marker-icon.png',
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

// ──────────── Define the Open-Meteo response shape we actually use ────────────
export type OpenMeteoResponse = {
  hourly: {
    cloudcover: number[];
    precipitation: number[];
    temperature_2m: number[];
    // If there are extra hourly fields, we don't strictly care here
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

interface Props {
  coords: { lat: number; lng: number } | null;
  // Replace "{}" with "Record<string, unknown>"
  onWeatherFetched: (data: OpenMeteoResponse | Record<string, unknown>) => void;
  triggerSwimScore?: boolean;
}

type WeatherLayer = {
  name: string;
  url: string;
  attribution: string;
  opacity: number;
};

const WEATHER_LAYERS: WeatherLayer[] = [
  {
    name: 'CloudCover',
    url: 'https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=YOUR_OPENWEATHERMAP_APPID',
    attribution: '© OpenWeatherMap',
    opacity: 0.5,
  },
  {
    name: 'Precipitation',
    url: 'https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=YOUR_OPENWEATHERMAP_APPID',
    attribution: '© OpenWeatherMap',
    opacity: 0.5,
  },
];

export default function WeatherMap({
  coords,
  onWeatherFetched,
  triggerSwimScore = false,
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const weatherLayersRef = useRef<Record<string, L.TileLayer>>({});
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // We track the last‐fetched coordinate string to prevent duplicate calls
  const lastCoordKey = useRef<string | null>(null);
  const fetchTimeout = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetches from `/api/OpenMateo?lat=...&lon=...` and validates the shape.
   * On success, calls onWeatherFetched(validResponse). On failure/invalid JSON, calls onWeatherFetched({}).
   */
  const fetchWeatherData = useCallback(
    async (lat: number, lon: number) => {
      lastCoordKey.current = `${lat.toFixed(5)},${lon.toFixed(5)}`;
      setError(null);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(`/api/OpenMateo?lat=${lat}&lon=${lon}`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`Status ${res.status}`);
        }

        const data: unknown = await res.json();
        // Narrow data to OpenMeteoResponse for type‐safe checks:
        const castData = data as OpenMeteoResponse;
        const maybeHourly = castData.hourly;

        const isValid =
          typeof data === 'object' &&
          data !== null &&
          maybeHourly !== null &&
          Array.isArray(maybeHourly.cloudcover) &&
          Array.isArray(maybeHourly.precipitation) &&
          Array.isArray(maybeHourly.temperature_2m);

        if (isValid) {
          onWeatherFetched(castData);
        } else {
          onWeatherFetched({});
          setError('Incomplete weather data received');
        }
      } catch (e) {
        console.error('Weather fetch error:', e);
        setError('Failed to fetch weather');
        onWeatherFetched({});
      }
    },
    [onWeatherFetched]
  );

  /**
   * Debounce helper: waits 300ms after the most recent call, then invokes fetchWeatherData.
   */
  const debouncedFetchWeather = useCallback(
    (lat: number, lon: number) => {
      const coordKey = `${lat.toFixed(5)},${lon.toFixed(5)}`;
      if (coordKey === lastCoordKey.current) return;

      if (fetchTimeout.current) {
        clearTimeout(fetchTimeout.current);
      }
      fetchTimeout.current = setTimeout(() => {
        fetchWeatherData(lat, lon);
      }, 300);
    },
    [fetchWeatherData]
  );

  // ──────────── Initialize Leaflet map once `coords` arrives ────────────
  useEffect(() => {
  if (!coords || leafletMapRef.current) return;
  // guard against missing container
  if (!mapContainerRef.current) return;

  let mapInstance: L.Map | null = null;
  try {
    mapInstance = L.map(mapContainerRef.current).setView(
      [coords.lat, coords.lng],
      10
    );
    leafletMapRef.current = mapInstance;

    // Base OSM tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(mapInstance);

    // Custom marker
    const customIcon = L.divIcon({
      html: '<div class="map-pin"><span class="map-pin__inner"></span></div><div class="map-pin__shadow"></div>',
      className: 'map-pin-wrapper',
      iconSize: [32, 40],
      iconAnchor: [16, 34],
    });
    const marker = L.marker([coords.lat, coords.lng], { icon: customIcon }).addTo(mapInstance);
    markerRef.current = marker;

    // Click handler: recenter + fetch new weather
    mapInstance.on('click', (e: L.LeafletMouseEvent) => {
      const lat = e.latlng.lat;
      const lon = e.latlng.lng;
      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return;
      marker.setLatLng([lat, lon]);
      mapInstance!.setView([lat, lon], mapInstance!.getZoom());
      debouncedFetchWeather(lat, lon);
    });

    // Build overlay layers
    initializeWeatherLayers(mapInstance);

    setMapReady(true);
    // If parent already wants weather immediately:
    if (triggerSwimScore) {
      debouncedFetchWeather(coords.lat, coords.lng);
    }
  } catch (e) {
    console.error('Map initialization failed:', e);
    setError('Failed to initialize map');
  }

  // CLEANUP: destroy old Leaflet map before effect re-runs (Strict Mode double‐invoke)
  return () => {
    if (mapInstance) {
      mapInstance.remove();
      leafletMapRef.current = null;
      setMapReady(false);
    }
  };
}, [coords, triggerSwimScore, debouncedFetchWeather]);

  // ──────────── Recenter & fetch if `coords` or `triggerSwimScore` changes ────────────
  useEffect(() => {
    if (!leafletMapRef.current || !coords || !mapReady) return;
    try {
      const mapInstance = leafletMapRef.current;
      mapInstance.setView([coords.lat, coords.lng], mapInstance.getZoom());
      if (triggerSwimScore) {
        debouncedFetchWeather(coords.lat, coords.lng);
      }
    } catch (e) {
      console.error('Map update failed:', e);
      setError('Failed to update map');
    }
  }, [coords, triggerSwimScore, debouncedFetchWeather, mapReady]);

  // ──────────── Build the overlay layers ────────────
  const initializeWeatherLayers = (map: L.Map) => {
    WEATHER_LAYERS.forEach((layer) => {
      const tileLayer = L.tileLayer(layer.url, {
        attribution: layer.attribution,
        opacity: layer.opacity,
        maxZoom: 18,
      });
      weatherLayersRef.current[layer.name] = tileLayer;
    });
    // Note: we're not adding layers to the map initially, they're toggled by the user
    // The 'map' parameter is available for future use if needed
    void map; // This tells TypeScript we're aware of the parameter
  };

  // ──────────── Toggle a single overlay on/off ────────────
  const toggleWeatherLayer = (layerName: string) => {
    const mapInstance = leafletMapRef.current;
    if (!mapInstance) return;
    const layer = weatherLayersRef.current[layerName];
    if (!layer) return;
    if (mapInstance.hasLayer(layer)) {
      mapInstance.removeLayer(layer);
    } else {
      layer.addTo(mapInstance);
    }
  };

  return (
    <div className="relative h-full w-full">
      {error && (
        <div className="absolute top-4 left-4 bg-red-100 text-red-700 p-2 rounded z-50">
          {error}
        </div>
      )}

      <div ref={mapContainerRef} className="leaflet-container h-full w-full"></div>

      <div className="absolute top-4 right-4 z-50 flex flex-col space-y-2">
        <button
          onClick={() => toggleWeatherLayer('CloudCover')}
          className="bg-white p-2 rounded shadow"
        >
          Toggle Clouds
        </button>
        <button
          onClick={() => toggleWeatherLayer('Precipitation')}
          className="bg-white p-2 rounded shadow"
        >
          Toggle Precipitation
        </button>
      </div>

      <style jsx>{`
        .leaflet-container {
          width: 100%;
          height: 100%;
        }
        .leaflet-popup-content {
          filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
        .leaflet-control-attribution {
          font-size: 10px;
          background: rgba(255, 255, 255, 0.8);
        }
      `}</style>
    </div>
  );
}
