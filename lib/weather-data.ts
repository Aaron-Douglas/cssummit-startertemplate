/**
 * Storm Watch weather data: the neighbourhoods, the types, and small pure helpers.
 *
 * Nothing in this file talks to the network, so it is safe to import anywhere (server or
 * browser). The one place that calls the weather API is `lib/weather.ts`.
 *
 * Weather data by Open-Meteo.com (CC BY 4.0). Every page that shows it must say so: use
 * `<WeatherAttribution />` from `components/weather-attribution.tsx`.
 */

/** The eight neighbourhoods we report on. Coordinates are [longitude, latitude]. */
export const NEIGHBORHOODS = [
  { id: "loop", name: "Loop", coordinates: [-87.63, 41.884] },
  { id: "bronzeville", name: "Bronzeville", coordinates: [-87.617, 41.824] },
  { id: "hyde-park", name: "Hyde Park", coordinates: [-87.593, 41.794] },
  { id: "pilsen", name: "Pilsen", coordinates: [-87.656, 41.856] },
  { id: "logan-square", name: "Logan Square", coordinates: [-87.708, 41.923] },
  { id: "austin", name: "Austin", coordinates: [-87.765, 41.894] },
  { id: "rogers-park", name: "Rogers Park", coordinates: [-87.668, 42.009] },
  { id: "south-shore", name: "South Shore", coordinates: [-87.576, 41.761] },
] as const satisfies readonly {
  id: string;
  name: string;
  coordinates: readonly [number, number];
}[];

export type Neighborhood = (typeof NEIGHBORHOODS)[number];

/** A simple sky description, worked out from the WMO weather code. */
export type Condition = "clear" | "cloudy" | "fog" | "rain" | "snow" | "storm";

/** Current weather for one neighbourhood. */
export type NeighborhoodWeather = {
  id: string;
  name: string;
  /** [longitude, latitude] */
  coordinates: readonly [number, number];
  /** °F */
  temperature: number;
  /** Inches of rain, showers and snow in Open-Meteo's latest reading interval (about 15 minutes). */
  precipitation: number;
  /** mph, 10 m above the ground */
  wind: number;
  /** WMO weather code, e.g. 61 = light rain. */
  weatherCode: number;
  condition: Condition;
  /** Local Chicago time of the reading, e.g. "2026-11-14T12:15". */
  asOf: string;
};

/** What the rest of the app gets back. `source` says whether it is real or made up. */
export type WeatherReport = {
  source: "live" | "sample";
  /** Local Chicago time of the readings, e.g. "2026-11-14T12:15". */
  asOf: string;
  neighborhoods: NeighborhoodWeather[];
};

/**
 * Turns a WMO weather code into one of our six conditions.
 * Codes: https://open-meteo.com/en/docs (scroll to "WMO Weather interpretation codes").
 */
export function conditionFromCode(code: number): Condition {
  if (code <= 1) return "clear"; // 0 clear sky, 1 mainly clear
  if (code <= 3) return "cloudy"; // 2 partly cloudy, 3 overcast
  if (code === 45 || code === 48) return "fog";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain"; // drizzle, rain, showers
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if (code >= 95 && code <= 99) return "storm"; // thunderstorms, with or without hail
  return "cloudy"; // a code we do not know: say cloudy rather than guess rain or sun
}

/** Short human words for a WMO code, e.g. 61 → "light rain". */
export function describeCode(code: number): string {
  const words: Record<number, string> = {
    0: "clear sky",
    1: "mainly clear",
    2: "partly cloudy",
    3: "overcast",
    45: "fog",
    48: "freezing fog",
    51: "light drizzle",
    53: "drizzle",
    55: "heavy drizzle",
    56: "freezing drizzle",
    57: "freezing drizzle",
    61: "light rain",
    63: "rain",
    65: "heavy rain",
    66: "freezing rain",
    67: "freezing rain",
    71: "light snow",
    73: "snow",
    75: "heavy snow",
    77: "snow grains",
    80: "light showers",
    81: "showers",
    82: "heavy showers",
    85: "snow showers",
    86: "heavy snow showers",
    95: "thunderstorm",
    96: "thunderstorm with hail",
    99: "thunderstorm with heavy hail",
  };
  return words[code] ?? conditionFromCode(code);
}

/**
 * "2026-11-14T12:15" → "12:15 PM". Open-Meteo already gives Chicago time (we ask for
 * `timezone=America/Chicago`), so we only reformat the text and never convert time zones.
 */
export function formatAsOf(time: string): string {
  const match = /T(\d{2}):(\d{2})/.exec(time);
  if (!match) return time;
  const hour = Number(match[1]);
  const suffix = hour < 12 ? "AM" : "PM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${match[2]} ${suffix}`;
}

/**
 * Reads Open-Meteo's JSON and returns one entry per neighbourhood, in NEIGHBORHOODS order.
 *
 * - Asking for several places (comma-separated coordinates) returns an ARRAY of objects, in
 *   the same order we asked. Asking for one place returns a single object. We handle both.
 * - Each object has `current: { time, temperature_2m, precipitation, weather_code,
 *   wind_speed_10m, ... }`.
 * - Throws if anything is missing, so bad data is never shown as if it were real.
 *
 * Pure function (no network), so it can be tested with a hand-written sample of the JSON.
 */
export function parseOpenMeteo(
  json: unknown,
  places: readonly Neighborhood[] = NEIGHBORHOODS,
): NeighborhoodWeather[] {
  const locations = Array.isArray(json) ? json : [json];
  if (locations.length !== places.length) {
    throw new Error(
      `Open-Meteo returned ${locations.length} locations, expected ${places.length}`,
    );
  }

  return places.map((place, index) => {
    const current = (locations[index] as { current?: Record<string, unknown> })
      ?.current;
    if (!current) throw new Error(`No "current" block for ${place.name}`);

    const time = current.time;
    const temperature = current.temperature_2m;
    const precipitation = current.precipitation;
    const wind = current.wind_speed_10m;
    const code = current.weather_code;
    if (
      typeof time !== "string" ||
      typeof temperature !== "number" ||
      typeof precipitation !== "number" ||
      typeof wind !== "number" ||
      typeof code !== "number"
    ) {
      throw new Error(`Missing or bad reading for ${place.name}`);
    }

    return {
      id: place.id,
      name: place.name,
      coordinates: place.coordinates,
      temperature: Math.round(temperature),
      precipitation,
      wind: Math.round(wind),
      weatherCode: code,
      condition: conditionFromCode(code),
      asOf: time,
    };
  });
}

/**
 * Made-up readings, used only when live weather cannot be reached (no Wi-Fi, the API is down,
 * it took too long). Pages show "Sample data (live weather unavailable)" whenever these are
 * used. They cover every condition so the map, chat and game all have something to show.
 */
const SAMPLE_TIME = "2026-11-14T09:00";
const SAMPLE_READINGS: Record<
  Neighborhood["id"],
  { temperature: number; precipitation: number; wind: number; code: number }
> = {
  loop: { temperature: 52, precipitation: 0.02, wind: 14, code: 61 },
  bronzeville: { temperature: 53, precipitation: 0.03, wind: 12, code: 63 },
  "hyde-park": { temperature: 54, precipitation: 0, wind: 18, code: 3 },
  pilsen: { temperature: 51, precipitation: 0.01, wind: 10, code: 80 },
  "logan-square": { temperature: 49, precipitation: 0, wind: 9, code: 45 },
  austin: { temperature: 48, precipitation: 0.05, wind: 22, code: 95 },
  "rogers-park": { temperature: 44, precipitation: 0.04, wind: 16, code: 71 },
  "south-shore": { temperature: 55, precipitation: 0, wind: 11, code: 1 },
};

export const SAMPLE_REPORT: WeatherReport = {
  source: "sample",
  asOf: SAMPLE_TIME,
  neighborhoods: NEIGHBORHOODS.map((place) => {
    const reading = SAMPLE_READINGS[place.id];
    return {
      id: place.id,
      name: place.name,
      coordinates: place.coordinates,
      temperature: reading.temperature,
      precipitation: reading.precipitation,
      wind: reading.wind,
      weatherCode: reading.code,
      condition: conditionFromCode(reading.code),
      asOf: SAMPLE_TIME,
    };
  }),
};
