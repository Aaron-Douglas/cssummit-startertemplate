/**
 * Storm Watch: the ONLY place that calls the weather API.
 *
 * Data: Open-Meteo (https://open-meteo.com). Free, no key, no sign-up. Licence CC BY 4.0, so
 * every page that shows this data must credit "Weather data by Open-Meteo.com"
 * (`<WeatherAttribution />` does that).
 *
 * How it works, in three steps:
 * 1. `fetchLiveWeather()` asks Open-Meteo for all eight neighbourhoods in ONE request and keeps
 *    the answer for about 10 minutes ("use cache"), so a busy page does not hammer the API.
 * 2. If the request fails or takes longer than 4 seconds, it THROWS. Next.js does not store a
 *    function's result when it throws, so a Wi-Fi blip is not remembered for 10 minutes: the
 *    next visitor simply tries again.
 * 3. `getChicagoWeather()` (outside the cache) catches that error and returns clearly labelled
 *    sample data instead, so the pages never break.
 */

// Next.js stops the build if a browser ("use client") file imports this one. You do not need
// to install the `server-only` package: Next.js handles this import itself.
import "server-only";

import { cacheLife } from "next/cache";
import {
  NEIGHBORHOODS,
  parseOpenMeteo,
  SAMPLE_REPORT,
  type WeatherReport,
} from "@/lib/weather-data";

export {
  type Condition,
  describeCode,
  formatAsOf,
  type NeighborhoodWeather,
  type WeatherReport,
} from "@/lib/weather-data";

/** Give up on Open-Meteo after this many milliseconds and use sample data. */
const TIMEOUT_MS = 4000;

/** The full request URL. Open the printed URL in a browser to see the raw JSON. */
function openMeteoUrl(): string {
  const params = new URLSearchParams({
    // One request for every neighbourhood: comma-separated lists, same order as NEIGHBORHOODS.
    latitude: NEIGHBORHOODS.map((n) => n.coordinates[1]).join(","),
    longitude: NEIGHBORHOODS.map((n) => n.coordinates[0]).join(","),
    current:
      "temperature_2m,precipitation,rain,snowfall,weather_code,wind_speed_10m",
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    precipitation_unit: "inch",
    timezone: "America/Chicago",
  });
  return `https://api.open-meteo.com/v1/forecast?${params}`;
}

/**
 * Live weather, cached for about 10 minutes. Throws on any problem (see step 2 above).
 * Not exported: always go through `getChicagoWeather()`, which has the safety net.
 */
async function fetchLiveWeather(): Promise<WeatherReport> {
  "use cache";
  cacheLife({
    stale: 300, // the browser may reuse it for 5 minutes
    revalidate: 600, // after 10 minutes the server fetches fresh weather
    expire: 1800, // after 30 minutes with no visitors, wait for fresh weather
  });

  const response = await fetch(openMeteoUrl(), {
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`Open-Meteo answered ${response.status}`);
  }

  const neighborhoods = parseOpenMeteo(await response.json());
  return { source: "live", asOf: neighborhoods[0].asOf, neighborhoods };
}

/**
 * Current weather for every neighbourhood. Never throws: when live weather is unavailable it
 * returns `SAMPLE_REPORT` with `source: "sample"`, and pages must say so on screen.
 *
 * Call it inside `<Suspense>` after `await connection()`, so the weather is fetched when
 * someone visits, not frozen into the page at build time.
 */
export async function getChicagoWeather(): Promise<WeatherReport> {
  try {
    return await fetchLiveWeather();
  } catch (error) {
    console.warn(
      "[weather] Live weather unavailable, using sample data:",
      error instanceof Error ? error.message : error,
    );
    return SAMPLE_REPORT;
  }
}
