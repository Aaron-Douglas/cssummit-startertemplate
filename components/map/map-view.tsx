"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import "./map.css";
import { MinusIcon, PlusIcon } from "lucide-react";
import { MapLibreMap, Marker, Popup, setWorkerUrl } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { categoryColor, categoryLabel } from "@/lib/map/categories";
import type { PlaceFeature } from "@/lib/map/places";
import { MAP_START } from "@/lib/map/places";

// MapLibre draws tiles in a Web Worker. Point it at the worker file inside the package so the
// bundler copies it next to the app (without this the worker 404s and the map stays blank).
setWorkerUrl(
  new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).href,
);

/**
 * Free vector tiles from OpenFreeMap (https://openfreemap.org): no API key, no sign-up.
 * Other styles: "liberty", "bright", "positron", "fiord". The attribution in the corner comes
 * from the tiles and must stay visible.
 */
export const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/dark";

export type Selection = { id: string; at: number } | null;

/**
 * The MapLibre map. Browser-only: map-explorer.tsx loads it with `ssr: false`, so it never
 * runs on the server. It draws one marker per place and flies to whatever is selected.
 */
export default function MapView({
  places,
  selection,
  onSelect,
  userLocation,
}: {
  places: PlaceFeature[];
  selection: Selection;
  onSelect: (id: string) => void;
  userLocation: [number, number] | null;
}) {
  const containerRef = useRef<HTMLElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef(new Map<string, Marker>());
  const popupRef = useRef<Popup | null>(null);
  const userMarkerRef = useRef<Marker | null>(null);
  const onSelectRef = useRef(onSelect);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // 1. Create the map once.
  useEffect(() => {
    if (!containerRef.current) return;
    let map: MapLibreMap;
    try {
      map = new MapLibreMap({
        container: containerRef.current,
        style: MAP_STYLE_URL,
        center: MAP_START.center,
        zoom: MAP_START.zoom,
        attributionControl: { compact: false },
        cooperativeGestures: false,
      });
    } catch {
      // Usually means the browser has WebGL turned off. The list still works.
      setFailed(true);
      return;
    }
    mapRef.current = map;
    // The dark style mentions a few icons its sprite sheet doesn't have ("wood-pattern").
    // Give MapLibre an empty image for them instead of a console warning.
    map.setMissingStyleImageResolver((id) => {
      if (!map.hasImage(id)) {
        map.addImage(id, { width: 1, height: 1, data: new Uint8Array(4) });
      }
    });
    popupRef.current = new Popup({
      offset: 18,
      maxWidth: "18rem",
      focusAfterOpen: false,
    });
    const markers = markersRef.current;
    return () => {
      for (const marker of markers.values()) marker.remove();
      markers.clear();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. One marker per visible place. Rebuilt when the category filter changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const markers = markersRef.current;
    for (const marker of markers.values()) marker.remove();
    markers.clear();
    for (const place of places) {
      const { id, name, category } = place.properties;
      const element = document.createElement("button");
      element.type = "button";
      element.className =
        "map-marker block size-5 rounded-badge border-2 border-background shadow-md transition-transform hover:scale-125 focus-visible:scale-125 data-[selected=true]:scale-150";
      element.style.background = categoryColor(category);
      element.setAttribute(
        "aria-label",
        `${name}, ${categoryLabel(category)}. Show details`,
      );
      element.addEventListener("click", (event) => {
        event.stopPropagation();
        onSelectRef.current(id);
      });
      const marker = new Marker({ element })
        .setLngLat(place.geometry.coordinates)
        .addTo(map);
      markers.set(id, marker);
    }
  }, [places]);

  // 3. Fly to the selected place and open its popup.
  useEffect(() => {
    const map = mapRef.current;
    const popup = popupRef.current;
    if (!map || !popup) return;
    for (const [id, marker] of markersRef.current) {
      marker
        .getElement()
        .setAttribute("data-selected", String(id === selection?.id));
    }
    const place = selection
      ? places.find((item) => item.properties.id === selection.id)
      : undefined;
    if (!place) {
      popup.remove();
      return;
    }
    // flyTo jumps instead of animating when the visitor prefers reduced motion.
    map.flyTo({
      center: place.geometry.coordinates,
      zoom: Math.max(map.getZoom(), 13),
      essential: false,
    });
    popup
      .setLngLat(place.geometry.coordinates)
      .setDOMContent(popupContent(place))
      .addTo(map);
  }, [selection, places]);

  // 4. "Use my location": a dot where the visitor is, then fly there.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;
    if (!userMarkerRef.current) {
      const element = document.createElement("div");
      element.className =
        "size-4 rounded-badge border-2 border-background bg-ring shadow-md";
      element.setAttribute("role", "img");
      element.setAttribute("aria-label", "Your location");
      userMarkerRef.current = new Marker({ element });
    }
    userMarkerRef.current.setLngLat(userLocation).addTo(map);
    map.flyTo({ center: userLocation, zoom: 12.5 });
  }, [userLocation]);

  if (failed) {
    return (
      <div className="flex h-full items-center justify-center p-card text-center text-sm text-muted-foreground">
        The map could not start in this browser (WebGL is off or unsupported).
        The list of places still works.
      </div>
    );
  }

  return (
    <div className="map-kit relative h-full w-full">
      {/* MapLibre's CSS makes this element position: relative, so size it with h-full. */}
      <section
        ref={containerRef}
        className="h-full w-full"
        aria-label="Map of Chicago neighborhoods. Use the list to move between them."
      />
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        <Button
          variant="secondary"
          size="icon-sm"
          aria-label="Zoom in"
          onClick={() => mapRef.current?.zoomIn()}
        >
          <PlusIcon />
        </Button>
        <Button
          variant="secondary"
          size="icon-sm"
          aria-label="Zoom out"
          onClick={() => mapRef.current?.zoomOut()}
        >
          <MinusIcon />
        </Button>
      </div>
    </div>
  );
}

/** Popup HTML built with textContent, so text from the data can never inject markup. */
function popupContent(place: PlaceFeature) {
  const {
    name,
    category,
    description,
    temperature,
    wind,
    precipitation,
    asOf,
  } = place.properties;
  const root = document.createElement("div");
  root.className = "flex flex-col gap-1.5 text-sm";

  // Small helper: one <p> with an optional class.
  const line = (text: string, className = "") => {
    const p = document.createElement("p");
    p.className = className;
    p.textContent = text;
    return p;
  };

  root.append(
    line(
      `${categoryLabel(category)} · ${description}`,
      "text-xs text-muted-foreground",
    ),
    line(name, "font-heading text-base font-semibold"),
    line(`${temperature}°F · wind ${wind} mph`),
    line(`Precipitation: ${precipitation.toFixed(2)} in`),
    line(asOf, "text-xs text-muted-foreground"),
  );

  return root;
}
