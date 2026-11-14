# Map kit

Adds a **Map** page at `/map`: a map of Chicago with a marker and popup for each place, a list
next to the map that stays in sync (tap a place to fly to it), category filters and a
"Use my location" button that sorts places by distance.

```bash
pnpm kit add map
pnpm dev            # open http://localhost:3000/map
```

No API key and no sign-up. Tiles come from [OpenFreeMap](https://openfreemap.org) and the map
is drawn by [MapLibre GL JS](https://maplibre.org) 6.

The ten places are **made up** ("(sample)" in every name) at rough neighborhood locations.

## What it adds

| File | What it is |
|---|---|
| `lib/map/places.ts` | **The data.** GeoJSON points, categories and the start position. Replace this. |
| `lib/map/categories.ts` | Category colours and labels, distance in miles. |
| `app/map/page.tsx` | The page (server component). |
| `components/map/map-explorer.tsx` | Filters, list and location button; loads the map with `ssr: false`. |
| `components/map/map-view.tsx` | The MapLibre map: markers, popups, fly-to, zoom buttons. Browser only. |
| `components/map/map.css` | Restyles MapLibre's popups and attribution with the design tokens. |

## Use your own places

Edit `lib/map/places.ts`. Each place is one GeoJSON `Feature`:

```ts
{
  type: "Feature",
  geometry: { type: "Point", coordinates: [-87.6298, 41.8781] }, // [longitude, latitude]
  properties: {
    id: "my-place",            // unique, no spaces
    name: "My place",
    category: "study",         // one of the ids in CATEGORIES
    neighborhood: "Loop",
    description: "Why someone should go here.",
    hours: "Mon–Fri 9–5",      // optional
  },
},
```

- **Longitude comes first.** In Chicago longitude is about -87.6 and latitude about 41.8. If a
  marker shows up in Antarctica, the two are swapped.
- Get coordinates by right-clicking a spot on openstreetmap.org ("Show address"), or draw
  points at [geojson.io](https://geojson.io) and copy the `features` array.
- Add or rename categories in `CATEGORIES`. The first five get the design's chart colours.
- Move the starting view with `MAP_START` (centre and zoom).
- Got a `.geojson` file from somewhere else? Paste its contents in as the value of `places`;
  TypeScript will flag any feature that is missing a field.

## Tiles and attribution

- OpenFreeMap is free and needs no key, but the map data belongs to
  OpenStreetMap contributors. **The credit line in the corner of the map
  (OpenFreeMap, © OpenMapTiles, Data from OpenStreetMap) is required. Do not hide it.**
- The style is `https://tiles.openfreemap.org/styles/dark` (set in `map-view.tsx`). Other
  OpenFreeMap styles: `liberty`, `bright`, `positron`, `fiord`.
- If you expect heavy traffic, read openfreemap.org first; they ask big users to self-host.

## How it works

- MapLibre needs the browser (`window`, WebGL), so `map-explorer.tsx` loads `map-view.tsx` with
  `next/dynamic` and `ssr: false`. The rest of the page renders on the server as usual.
- `map-view.tsx` calls `setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url))`
  so the bundler ships MapLibre's worker file. Without it the map stays blank with
  "Worker failed to load" in the console.
- The browser asks for location permission only when "Use my location" is pressed. Location
  needs HTTPS (or `localhost`); on a deployed Vercel URL it works.
- If WebGL is off, the map area shows a short message and the list still works.
- Colours: markers and filter dots use `var(--chart-1)` … `var(--chart-4)`; popups and the
  attribution use the `popover`, `border` and `background` tokens via `map.css`.
