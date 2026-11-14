import { defaultTuning, type Tuning } from "@/lib/game/config";
import { describeCode, type NeighborhoodWeather } from "@/lib/weather-data";

/**
 * Today's storm level: turns the current weather in the Loop into game settings.
 *
 *   level 0  clear skies       a calm, easy round
 *   level 1  cloudy or fog     the normal game
 *   level 2  rain or snow      drops spawn faster
 *   level 3  heavy rain/snow,  drops spawn fastest
 *            or a thunderstorm (thunderstorms also bring much more hail)
 *
 * Snow keeps the same rules but the drops are called snowflakes.
 * Runs on the server (app/play/page.tsx); the result is passed to <Game tuning={...} />.
 */

export type StormLevel = 0 | 1 | 2 | 3;

export type Storm = {
  level: StormLevel;
  /** e.g. "light rain, 52°F" */
  summary: string;
  tuning: Tuning;
};

/** Precipitation (inches per reading) that counts as heavy. */
const HEAVY = 0.05;

export function stormLevel(weather: NeighborhoodWeather): StormLevel {
  switch (weather.condition) {
    case "clear":
      return 0;
    case "cloudy":
    case "fog":
      return 1;
    case "rain":
    case "snow":
      return weather.precipitation >= HEAVY ? 3 : 2;
    case "storm":
      return 3;
  }
}

/** Seconds between new items at the start of a round, for each level. Smaller = more items. */
const START_INTERVAL: Record<StormLevel, number> = {
  0: 1.1,
  1: defaultTuning.spawn.startInterval, // 0.85, the normal game
  2: 0.7,
  3: 0.55,
};

/** How fast items fall at the start of a round, for each level. */
const START_SPEED: Record<StormLevel, number> = {
  0: 100,
  1: defaultTuning.fall.startSpeed, // 120, the normal game
  2: 135,
  3: 150,
};

export function stormFromWeather(weather: NeighborhoodWeather): Storm {
  const level = stormLevel(weather);
  const thunder = weather.condition === "storm";
  const snow = weather.condition === "snow";

  // Hail: rare on a clear day, normal otherwise, lots in a thunderstorm.
  const hail = level === 0 ? 12 : thunder ? 40 : defaultTuning.weights.hail;

  return {
    level,
    summary: `${describeCode(weather.weatherCode)}, ${weather.temperature}°F`,
    tuning: {
      ...defaultTuning,
      dropLabel: snow ? "snowflake" : "raindrop",
      weights: { ...defaultTuning.weights, hail },
      spawn: {
        ...defaultTuning.spawn,
        startInterval: START_INTERVAL[level],
        // A calm round never gets as hectic as a stormy one.
        minInterval: level === 0 ? 0.45 : defaultTuning.spawn.minInterval,
      },
      fall: { ...defaultTuning.fall, startSpeed: START_SPEED[level] },
    },
  };
}
