// pages/api/OpenMateo.ts

import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Minimal shape for the Open-Meteo response we expect.
 * If you only use a subset (e.g. hourly.cloudcover), you can
 * narrow this interface further.
 */
export type OpenMeteoResponse = {
  hourly: {
    cloudcover: number[];
    precipitation: number[];
    temperature_2m: number[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

/** Type‐guard to verify runtime shape of an object */
function isOpenMeteoResponse(data: unknown): data is OpenMeteoResponse {
  if (typeof data !== 'object' || data === null) return false;
  const maybe = data as Record<string, unknown>;
  const hourly = maybe.hourly;
  if (typeof hourly !== 'object' || hourly === null) return false;

  const hc = (hourly as Record<string, unknown>).cloudcover;
  const pr = (hourly as Record<string, unknown>).precipitation;
  const tt = (hourly as Record<string, unknown>).temperature_2m;

  return (
    Array.isArray(hc) &&
    hc.every((x) => typeof x === 'number') &&
    Array.isArray(pr) &&
    pr.every((x) => typeof x === 'number') &&
    Array.isArray(tt) &&
    tt.every((x) => typeof x === 'number')
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OpenMeteoResponse | { error: string }>
) {
  const { lat, lon } = req.query;
  if (typeof lat !== 'string' || typeof lon !== 'string') {
    return res.status(400).json({ error: 'Missing latitude or longitude' });
  }

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=cloudcover,precipitation,temperature_2m`
    );
    if (!response.ok) {
      throw new Error(`Open-Meteo status ${response.status}`);
    }

    const raw: unknown = await response.json();
    if (isOpenMeteoResponse(raw)) {
      return res.status(200).json(raw);
    } else {
      return res
        .status(500)
        .json({ error: 'Unexpected Open-Meteo response format' });
    }
  } catch (e) {
    console.error('Open-Meteo Fetch Error:', e);
    return res.status(500).json({ error: 'Failed to fetch weather data' });
  }
}
