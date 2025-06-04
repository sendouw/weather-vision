// pages/api/wave-data.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export interface WaveData {
  waveHeight: number; // meters
  waveDirection: number; // degrees
  wavePeriod: number; // seconds
  swellHeight?: number; // meters
  swellDirection?: number; // degrees
  swellPeriod?: number; // seconds
  timestamp: string;
  location: {
    lat: number;
    lon: number;
  };
}

export interface WaveApiResponse {
  success: boolean;
  data?: WaveData;
  error?: string;
  message?: string;
}

// Function to fetch from Open-Meteo Marine API (free, no API key required)
async function fetchOpenMeteoMarineData(lat: number, lon: number): Promise<WaveData> {
  const baseUrl = 'https://marine-api.open-meteo.com/v1/marine';
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: 'wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_direction,swell_wave_period',
    timezone: 'auto'
  });

  const response = await fetch(`${baseUrl}?${params}`, {
    headers: {
      'User-Agent': 'WeatherVision-App/1.0'
    }
  });

  if (!response.ok) {
    throw new Error(`Open-Meteo Marine API error: ${response.status}`);
  }

  const data = await response.json();
  const current = data.current;

  return {
    waveHeight: current.wave_height || 0,
    waveDirection: current.wave_direction || 0,
    wavePeriod: current.wave_period || 0,
    swellHeight: current.swell_wave_height || undefined,
    swellDirection: current.swell_wave_direction || undefined,
    swellPeriod: current.swell_wave_period || undefined,
    timestamp: current.time || new Date().toISOString(),
    location: { lat, lon }
  };
}

// Function to estimate wave data from wind data (fallback)
function estimateWaveFromWind(windSpeed: number, windDirection: number): Partial<WaveData> {
  // Basic wave height estimation using wind speed (simplified Beaufort scale)
  const waveHeight = Math.max(0, Math.pow(windSpeed / 10, 1.5) * 0.5);
  const wavePeriod = Math.max(2, Math.sqrt(waveHeight * 9.81) * 1.5); // Approximation
  
  return {
    waveHeight: Math.round(waveHeight * 100) / 100,
    waveDirection: windDirection,
    wavePeriod: Math.round(wavePeriod * 10) / 10
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WaveApiResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({
      success: false,
      error: 'Missing latitude or longitude parameters'
    });
  }

  // Validate coordinates
  const latitude = parseFloat(lat as string);
  const longitude = parseFloat(lon as string);

  if (isNaN(latitude) || isNaN(longitude) || 
      latitude < -90 || latitude > 90 || 
      longitude < -180 || longitude > 180) {
    return res.status(400).json({
      success: false,
      error: 'Invalid coordinates'
    });
  }

  try {
    // Try Open-Meteo Marine API first
    try {
      const waveData = await fetchOpenMeteoMarineData(latitude, longitude);
      return res.status(200).json({
        success: true,
        data: waveData,
        message: 'Marine data from Open-Meteo'
      });
    } catch (marineError) {
      console.log('Marine API failed, trying weather data fallback:', marineError);
      
      // Fallback: Get wind data from Open-Meteo weather API and estimate waves
      const weatherUrl = 'https://api.open-meteo.com/v1/forecast';
      const weatherParams = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        current: 'wind_speed_10m,wind_direction_10m',
        timezone: 'auto'
      });

      const weatherResponse = await fetch(`${weatherUrl}?${weatherParams}`);
      
      if (!weatherResponse.ok) {
        throw new Error(`Weather API error: ${weatherResponse.status}`);
      }

      const weatherData = await weatherResponse.json();
      const current = weatherData.current;

      if (!current || typeof current.wind_speed_10m !== 'number') {
        throw new Error('No wind data available for wave estimation');
      }

      const estimatedWaves = estimateWaveFromWind(
        current.wind_speed_10m,
        current.wind_direction_10m || 0
      );

      const waveData: WaveData = {
        waveHeight: estimatedWaves.waveHeight || 0,
        waveDirection: estimatedWaves.waveDirection || 0,
        wavePeriod: estimatedWaves.wavePeriod || 0,
        timestamp: current.time || new Date().toISOString(),
        location: { lat: latitude, lon: longitude }
      };

      return res.status(200).json({
        success: true,
        data: waveData,
        message: 'Wave data estimated from wind conditions'
      });
    }

  } catch (error) {
    console.error('Wave data fetch error:', error);
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch wave data'
    });
  }
}