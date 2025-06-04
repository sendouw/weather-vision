// src/pages/api/swimscore.ts

import type { NextApiRequest, NextApiResponse } from 'next';

/** 
 * Input type for /api/swimscore. All fields come from your client‐side mapping.
 */
export type SwimInputs = {
  windSpeed: number;        // in km/h
  windGust: number;
  windDirection: number;
  weatherCode: string;      // If using string codes like "95" or "thunderstorm"
  precipAmount: number;
  precipLast24h: number;
  visibility: number;       // in meters
  airQualityIndex: number;
  uvIndex: number;
  cloudCover: number;       // % 0–100
  apparentTemp: number;     // °C
  sst: number;              // Sea Surface Temp °C
};

/**
 * Output type for /api/swimscore. 
 * We return totalScore, breakdown, explanation array of strings,
 * plus recommendation and bestTimeToSwim to avoid any "unused variable" warnings.
 */
export type SwimScoreOutput = {
  totalScore: number;
  breakdown: {
    safety: number;
    comfort: number;
    performance: number;
  };
  explanation: string[];
  recommendation: string;
  bestTimeToSwim?: string;
};

/** 
 * Build an explanation array based on all three sub-scores + inputs/total. 
 * This function _does_ reference inputs (e.g. check inputs.weatherCode).
 */
function buildExplanation({
  safety,
  comfort,
  performance,
  inputs,
  total,
}: {
  safety: number;
  comfort: number;
  performance: number;
  inputs: SwimInputs;
  total: number;
}): string[] {
  const messages: string[] = [];

  // Use the breakdown scores to generate score-based insights:
  if (safety < 20) {
    messages.push(`⚠️ Safety score is critically low (${safety}/100)`);
  } else if (safety < 40) {
    messages.push(`⚠️ Safety concerns present (score: ${safety}/100)`);
  }

  if (comfort < 20) {
    messages.push(`😣 Comfort conditions are poor (score: ${comfort}/100)`);
  } else if (comfort > 80) {
    messages.push(`😊 Excellent comfort conditions (score: ${comfort}/100)`);
  }

  if (performance < 20) {
    messages.push(`🏃 Performance conditions are challenging (score: ${performance}/100)`);
  }

  // Critical safety alerts (highest priority)
  if (String(inputs.weatherCode).includes('thunderstorm') || inputs.weatherCode === '95') {
    messages.push('⚡ DANGER: Thunderstorm activity detected - do not enter water');
  }
  if (inputs.windSpeed >= 40) {
    messages.push('🌬️ Strong winds reduce safety for swimmers');
  }
  if (inputs.sst < 15) {
    messages.push('❄️ Water too cold (<15 °C) - risk of hypothermia');
  }
  if (inputs.precipAmount >= 10 || inputs.precipLast24h >= 30) {
    messages.push('🌧️ Heavy precipitation may reduce visibility and safety');
  }
  if (inputs.visibility < 1000) {
    messages.push('⚠️ Low visibility (<1 km) is unsafe for water activities');
  }
  if (inputs.airQualityIndex >= 150) {
    messages.push('😷 Poor air quality (AQI ≥ 150) - consider wearing a mask');
  }

  // Now add “comfort” insights
  if (inputs.apparentTemp > 38) {
    messages.push('🔥 Very hot air temperature (> 38 °C) may be uncomfortable');
  } else if (inputs.apparentTemp < 18) {
    messages.push('🥶 Chilly air temperature (< 18 °C) may be uncomfortable');
  }
  if (inputs.uvIndex >= 11) {
    messages.push('🧴 Extreme UV levels (UV ≥ 11) - apply SPF 30+ sunscreen');
  } else if (inputs.uvIndex >= 9) {
    messages.push('☀️ High UV (UV ≥ 9) - apply sunscreen and limit exposure');
  }

  // Performance insights
  if (inputs.windSpeed > 20 && inputs.apparentTemp < 26) {
    messages.push('🌬️ Wind chill may make you feel colder when wet');
  }
  if (inputs.cloudCover < 20 && inputs.uvIndex >= 6) {
    messages.push('😎 Clear skies + UV ≥ 6 - bring shade and protective gear');
  }

  // Finally, prefix a summary based on the “total” score
  if (total >= 80) {
    messages.unshift('🏊 Ideal conditions for a swim!');
  } else if (total >= 50) {
    messages.unshift('🤔 Moderate conditions; swim with caution.');
  } else {
    messages.unshift('🚫 Conditions not recommended for swimming.');
  }

  return messages;
}


/** 
 * Get a simple recommendation string based on total score and inputs.
 */
function getRecommendation(total: number, inputs: SwimInputs): string {
  // Use inputs to provide more context-aware recommendations
  if (String(inputs.weatherCode).includes('thunderstorm') || inputs.weatherCode === '95') {
    return 'DANGER: Do not swim - thunderstorm activity detected!';
  }
  if (inputs.windSpeed >= 40) {
    return 'Unsafe: Extreme wind conditions - avoid swimming.';
  }
  if (inputs.sst < 15) {
    return 'Unsafe: Water temperature too cold - risk of hypothermia.';
  }
  
  if (total >= 80) return 'Go ahead! Enjoy your swim.';
  if (total >= 50) return 'Consider caution: check current conditions.';
  return 'Not recommended: unsafe to swim.';
}

/**
 * Dummy function for "best time to swim."
 */
function getBestTimeToSwim(inputs: SwimInputs): string {
  if (inputs.precipAmount > 0) return 'Rainy – No best time.';
  return 'Afternoon (2 PM – 4 PM)';
}

/**
 * Validate that incoming JSON actually matches SwimInputs.
 */
function validateInputs(data: unknown): data is SwimInputs {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;

  return (
    typeof obj.windSpeed === 'number' &&
    typeof obj.windGust === 'number' &&
    typeof obj.windDirection === 'number' &&
    typeof obj.weatherCode === 'string' &&
    typeof obj.precipAmount === 'number' &&
    typeof obj.precipLast24h === 'number' &&
    typeof obj.visibility === 'number' &&
    typeof obj.airQualityIndex === 'number' &&
    typeof obj.uvIndex === 'number' &&
    typeof obj.cloudCover === 'number' &&
    typeof obj.apparentTemp === 'number' &&
    typeof obj.sst === 'number'
  );
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<SwimScoreOutput | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;

    if (!validateInputs(data)) {
      return res.status(400).json({ error: 'Invalid input data' });
    }
    const inputs = data as SwimInputs;

    // Compute breakdown scores
    const safety = calcSafety(inputs);
    const comfort = calcComfort(inputs);
    const performance = calcPerformance(inputs);

    // Weighted average: if safety ≤ 10, force total = safety
    const total =
      safety <= 10
        ? safety
        : Math.round(safety * 0.5 + comfort * 0.3 + performance * 0.2);

    // Build explanation, recommendation, bestTime
    const explanation = buildExplanation({ safety, comfort, performance, inputs, total });
    const recommendation = getRecommendation(total, inputs);
    const bestTimeToSwim = getBestTimeToSwim(inputs);

    const output: SwimScoreOutput = {
      totalScore: total,
      breakdown: { safety, comfort, performance },
      explanation,
      recommendation,
      bestTimeToSwim,
    };

    return res.status(200).json(output);
  } catch (error) {
    console.error('SwimScore API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/** 
 * Calculate "safety" based on critical weather thresholds.
 */
function calcSafety(inputs: SwimInputs): number {
  let score = 60; // Base safety score
  const { windSpeed, weatherCode, precipAmount, precipLast24h, visibility, airQualityIndex, sst, windGust } =
    inputs;

  // Critical safety conditions
  if (String(weatherCode).includes('thunderstorm') || weatherCode === '95') return 5;
  if (windSpeed >= 50 || windGust >= 60) return 8;
  if (windSpeed >= 40 || windGust >= 50) return 12;

  // Wind safety
  if (windSpeed >= 30) score -= 20;
  else if (windSpeed >= 25) score -= 15;
  else if (windSpeed >= 20) score -= 10;
  else if (windSpeed >= 15) score -= 5;

  // Precipitation safety
  if (precipAmount >= 15 || precipLast24h >= 50) score -= 15;
  else if (precipAmount >= 10 || precipLast24h >= 30) score -= 10;
  else if (precipAmount >= 5 || precipLast24h >= 15) score -= 5;

  // Visibility safety
  if (visibility < 500) score -= 15;
  else if (visibility < 1000) score -= 10;
  else if (visibility < 3000) score -= 5;

  // Water temperature safety
  if (sst < 15) score -= 20;
  else if (sst < 18) score -= 15;
  else if (sst > 32) score -= 10;
  else if (sst > 30) score -= 5;

  // Air quality
  if (airQualityIndex >= 150) score -= 10;
  else if (airQualityIndex >= 100) score -= 5;

  return Math.max(score, 0);
}

/** 
 * Calculate "comfort" (temperature + cloud cover + UV).
 */
function calcComfort(inputs: SwimInputs): number {
  let score = 35; // Base comfort score
  const { apparentTemp, uvIndex, cloudCover, sst, windSpeed, precipAmount } = inputs;

  // Temperature comfort
  if (apparentTemp > 42) score -= 15;
  else if (apparentTemp > 38) score -= 10;
  else if (apparentTemp > 35) score -= 5;
  else if (apparentTemp >= 24 && apparentTemp <= 32) score += 5;
  else if (apparentTemp < 18) score -= 15;
  else if (apparentTemp < 22) score -= 8;

  // UV considerations
  if (uvIndex >= 11) score -= 12;
  else if (uvIndex >= 9) score -= 8;
  else if (uvIndex >= 7) score -= 5;
  else if (uvIndex >= 3 && uvIndex <= 6) score += 2;

  // Cloud cover comfort
  if (cloudCover >= 20 && cloudCover <= 70) score += 3;
  else if (cloudCover > 95) score -= 5;
  else if (cloudCover < 10) score -= 2;

  // Water temperature comfort
  if (sst >= 24 && sst <= 28) score += 8;
  else if (sst >= 22 && sst <= 30) score += 3;
  else if (sst < 20 || sst > 31) score -= 8;

  // Rain discomfort
  if (precipAmount > 5) score -= 5;

  // Wind discomfort
  if (windSpeed > 25) score -= 5;
  else if (windSpeed > 20) score -= 3;

  return Math.max(score, 0);
}

/** 
 * Calculate "performance" (wind speed & direction relative to beach orientation).
 */
function calcPerformance(inputs: SwimInputs): number {
  let score = 25; // Base performance score
  const { windSpeed, sst, airQualityIndex, apparentTemp, cloudCover, visibility } = inputs;

  // Wind impact on performance
  if (windSpeed < 5) score += 2;
  else if (windSpeed >= 10 && windSpeed < 15) score -= 3;
  else if (windSpeed >= 15 && windSpeed < 20) score -= 5;
  else if (windSpeed >= 20 && windSpeed < 25) score -= 8;
  else if (windSpeed >= 25) score -= 12;

  // Water temperature for performance
  if (sst >= 22 && sst <= 26) score += 5;
  else if (sst >= 20 && sst <= 28) score += 2;
  else if (sst < 18 || sst > 30) score -= 8;
  else if (sst < 20 || sst > 28) score -= 4;

  // Air quality impact
  if (airQualityIndex < 25) score += 2;
  else if (airQualityIndex >= 50 && airQualityIndex < 100) score -= 2;
  else if (airQualityIndex >= 100 && airQualityIndex < 150) score -= 6;
  else if (airQualityIndex >= 150) score -= 10;

  // Temperature for activity
  if (apparentTemp >= 26 && apparentTemp <= 30) score += 3;
  else if (apparentTemp > 35) score -= 6;
  else if (apparentTemp < 20) score -= 4;

  // Visibility impact
  if (visibility < 2000) score -= 10;
  else if (visibility < 5000) score -= 5;

  // Cloud cover for performance (some is good for not overheating)
  if (cloudCover >= 30 && cloudCover <= 70) score += 2;

  return Math.max(score, 0);
}