/**
 * SAMPLE PLACES. Made-up names at approximate neighborhood locations, for the starter only.
 * None of these is a real organisation, and the hours are invented.
 *
 * This is the one file to replace. It is GeoJSON (the standard format every map tool can
 * export), written as TypeScript so a typo shows up as an error instead of a blank map.
 *
 * - Coordinates are [longitude, latitude]: longitude first. Chicago is about [-87.6, 41.8].
 *   If a marker lands in the wrong place, the two numbers are probably swapped.
 * - Find coordinates: right-click a spot on openstreetmap.org → "Show address", or use
 *   geojson.io to draw points and copy the result.
 * - Add a category by adding it to CATEGORIES and using its id on a place.
 */

export const CATEGORIES = [
  { id: "study", label: "Study spots" },
  { id: "community", label: "Community centers" },
  { id: "food", label: "Free food" },
  { id: "outdoors", label: "Outdoors" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export type PlaceProperties = {
  /** Unique id, any string without spaces. */
  id: string;
  name: string;
  category: CategoryId;
  neighborhood: string;
  description: string;
  hours?: string;
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
  center: [-87.66, 41.84] as [number, number],
  zoom: 10.3,
};

export const places: PlaceCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-87.617, 41.824] },
      properties: {
        id: "bronzeville-study-hall",
        name: "Bronzeville Study Hall (sample)",
        category: "study",
        neighborhood: "Bronzeville",
        description: "Quiet tables, outlets at every seat, free printing.",
        hours: "Mon–Fri 3–9 pm",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-87.656, 41.856] },
      properties: {
        id: "pilsen-maker-space",
        name: "Pilsen Maker Space (sample)",
        category: "community",
        neighborhood: "Pilsen",
        description: "Laptops to borrow and a weekly coding club.",
        hours: "Tue & Thu 4–8 pm",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-87.591, 41.794] },
      properties: {
        id: "hyde-park-reading-room",
        name: "Hyde Park Reading Room (sample)",
        category: "study",
        neighborhood: "Hyde Park",
        description: "Open late during finals. Group rooms by sign-up.",
        hours: "Daily 9 am–11 pm",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-87.765, 41.894] },
      properties: {
        id: "austin-community-kitchen",
        name: "Austin Community Kitchen (sample)",
        category: "food",
        neighborhood: "Austin",
        description: "Free hot dinner for students, no sign-up needed.",
        hours: "Wed 5–7 pm",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-87.721, 41.902] },
      properties: {
        id: "humboldt-park-lawn",
        name: "Humboldt Park Lawn (sample)",
        category: "outdoors",
        neighborhood: "Humboldt Park",
        description:
          "Shaded benches by the lagoon. Good Wi-Fi near the boathouse.",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-87.645, 41.78] },
      properties: {
        id: "englewood-youth-center",
        name: "Englewood Youth Center (sample)",
        category: "community",
        neighborhood: "Englewood",
        description: "Homework help and mentoring with college volunteers.",
        hours: "Mon–Thu 3–7 pm",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-87.632, 41.8525] },
      properties: {
        id: "chinatown-tea-and-study",
        name: "Chinatown Tea & Study (sample)",
        category: "food",
        neighborhood: "Chinatown",
        description: "Free tea refills for students. Big tables.",
        hours: "Daily 11 am–8 pm",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-87.6535, 41.9665] },
      properties: {
        id: "uptown-library-corner",
        name: "Uptown Library Corner (sample)",
        category: "study",
        neighborhood: "Uptown",
        description: "Silent floor, laptop lockers and free coffee on Mondays.",
        hours: "Mon–Sat 10 am–8 pm",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-87.612, 41.74] },
      properties: {
        id: "chatham-tech-hub",
        name: "Chatham Tech Hub (sample)",
        category: "community",
        neighborhood: "Chatham",
        description: "Open lab with desktops and a 3D printer.",
        hours: "Fri–Sat 12–6 pm",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-87.576, 41.761] },
      properties: {
        id: "south-shore-lakefront",
        name: "South Shore Lakefront (sample)",
        category: "outdoors",
        neighborhood: "South Shore",
        description: "Lake views and picnic tables for outdoor study days.",
      },
    },
  ],
};
