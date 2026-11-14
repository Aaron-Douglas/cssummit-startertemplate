/**
 * STORM WATCH: one map point per neighbourhood, built from the current weather.
 *
 * The weather itself comes from `lib/weather.ts` (Open-Meteo). This file only reshapes it into
 * GeoJSON, the standard format every map tool understands.
 *
 * - Coordinates are [longitude, latitude]: longitude first. Chicago is about [-87.6, 41.8].
 *   If a marker lands in the wrong place, the two numbers are probably swapped.
 * - The "categories" are weather conditions. Their colours live in `lib/map/categories.ts`.
 */

import {
  type Condition,
  describeCode,
  formatAsOf,
  type WeatherReport,
} from "@/lib/weather-data";

/** The filter buttons, in order. One per weather condition. */
export const CATEGORIES = [
  { id: "clear", label: "Clear" },
  { id: "cloudy", label: "Cloudy" },
  { id: "fog", label: "Fog" },
  { id: "rain", label: "Rain" },
  { id: "snow", label: "Snow" },
  { id: "storm", label: "Storm" },
] as const satisfies readonly { id: Condition; label: string }[];

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export type PlaceProperties = {
  /** Unique id, any string without spaces. */
  id: string;
  /** The neighbourhood, e.g. "Pilsen". */
  name: string;
  /** The weather condition, used for the colour and the filters. */
  category: CategoryId;
  /** Plain words for the sky, e.g. "light rain". */
  description: string;
  /** °F */
  temperature: number;
  /** mph */
  wind: number;
  /** inches */
  precipitation: number;
  /** When the reading was taken, e.g. "As of 12:15 PM", or a note that it is sample data. */
  asOf: string;
};

export type PlaceFeature = {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [lng: number, lat: number] };
  properties: PlaceProperties;
};

export type PlaceCollection = {
  type: "FeatureCollection";
  features: PlaceFeature[];
};

/** Where the map starts and how far it is zoomed in. */
export const MAP_START = {
  center: [-87.66, 41.88] as [number, number],
  zoom: 10,
};

/** Turns a weather report into map points: one per neighbourhood. */
export function placesFromWeather(report: WeatherReport): PlaceCollection {
  return {
    type: "FeatureCollection",
    features: report.neighborhoods.map((spot) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [spot.coordinates[0], spot.coordinates[1]],
      },
      properties: {
        id: spot.id,
        name: spot.name,
        category: spot.condition,
        description: describeCode(spot.weatherCode),
        temperature: spot.temperature,
        wind: spot.wind,
        precipitation: spot.precipitation,
        asOf:
          report.source === "live"
            ? `As of ${formatAsOf(spot.asOf)}`
            : "Sample reading, not live weather",
      },
    })),
  };
}
