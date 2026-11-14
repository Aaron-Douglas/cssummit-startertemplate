"use client";

import { LoaderCircleIcon, LocateFixedIcon, MapPinIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  categoryColor,
  categoryLabel,
  milesBetween,
} from "@/lib/map/categories";
import {
  CATEGORIES,
  type CategoryId,
  type PlaceCollection,
} from "@/lib/map/places";
import { cn } from "@/lib/utils";
import type { Selection } from "./map-view";

// MapLibre needs `window` and WebGL, so the map only loads in the browser.
// `ssr: false` is allowed here because this file is a Client Component.
const MapView = dynamic(() => import("./map-view"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      Loading map…
    </div>
  ),
});

type Filter = CategoryId | "all";

/** Category filter, the list of places and the map, kept in sync. */
export function MapExplorer({ data }: { data: PlaceCollection }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [selection, setSelection] = useState<Selection>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [locating, setLocating] = useState(false);
  const mapBoxRef = useRef<HTMLDivElement>(null);

  const visible = useMemo(() => {
    const filtered = data.features.filter(
      (place) => filter === "all" || place.properties.category === filter,
    );
    if (!userLocation) return filtered;
    return [...filtered].sort(
      (a, b) =>
        milesBetween(userLocation, a.geometry.coordinates) -
        milesBetween(userLocation, b.geometry.coordinates),
    );
  }, [data, filter, userLocation]);

  function select(id: string, fromList: boolean) {
    setSelection({ id, at: Date.now() });
    // On phones the map sits above the list: bring it into view after a list tap.
    if (fromList && window.matchMedia("(max-width: 63.99rem)").matches) {
      mapBoxRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // The browser asks for permission only when this button is pressed.
  function locate() {
    if (!("geolocation" in navigator)) {
      toast.error("This browser can't share your location.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        setUserLocation([position.coords.longitude, position.coords.latitude]);
        toast.success("Showing places nearest to you first.");
      },
      (error) => {
        setLocating(false);
        toast.error(
          error.code === error.PERMISSION_DENIED
            ? "Location permission was denied. You can allow it in your browser's site settings."
            : "Couldn't find your location. Try again in a moment.",
        );
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    );
  }

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    ...CATEGORIES,
  ];

  return (
    <div className="flex flex-col gap-stack">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Filter by category</legend>
          {filters.map((item) => (
            <Button
              key={item.id}
              size="sm"
              variant={filter === item.id ? "default" : "outline"}
              aria-pressed={filter === item.id}
              onClick={() => setFilter(item.id)}
            >
              {item.id !== "all" ? (
                <span
                  aria-hidden
                  className="size-2.5 rounded-badge"
                  style={{ background: categoryColor(item.id) }}
                />
              ) : null}
              {item.label}
            </Button>
          ))}
        </fieldset>
        <Button
          variant="secondary"
          size="sm"
          onClick={locate}
          disabled={locating}
        >
          {locating ? (
            <LoaderCircleIcon className="animate-spin" />
          ) : (
            <LocateFixedIcon />
          )}
          Use my location
        </Button>
      </div>

      <div className="grid gap-stack lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <div
          ref={mapBoxRef}
          className="surface relative order-1 h-[60svh] min-h-80 max-h-[32rem] scroll-mt-24 overflow-hidden rounded-card lg:order-2 lg:h-[36rem] lg:max-h-none"
        >
          <MapView
            places={visible}
            selection={selection}
            onSelect={(id) => select(id, false)}
            userLocation={userLocation}
          />
        </div>

        <div className="order-2 flex flex-col gap-2 lg:order-1 lg:max-h-[36rem] lg:overflow-y-auto lg:pr-1">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {visible.length} {visible.length === 1 ? "place" : "places"}
            {userLocation ? ", nearest first" : ""}
          </p>
          <ul className="flex flex-col gap-2">
            {visible.map((place) => {
              const { id, name, category, neighborhood } = place.properties;
              const active = selection?.id === id;
              const miles = userLocation
                ? milesBetween(userLocation, place.geometry.coordinates)
                : null;
              return (
                <li key={id}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => select(id, true)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-card border bg-card p-3 text-left transition-colors hover:bg-muted",
                      active &&
                        "border-primary bg-primary-tint hover:bg-primary-tint",
                    )}
                  >
                    <span
                      aria-hidden
                      className="mt-1.5 size-2.5 shrink-0 rounded-badge"
                      style={{ background: categoryColor(category) }}
                    />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="font-medium">{name}</span>
                      <span className="text-xs text-muted-foreground">
                        {categoryLabel(category)} · {neighborhood}
                      </span>
                    </span>
                    {miles !== null ? (
                      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                        {miles < 10 ? miles.toFixed(1) : Math.round(miles)} mi
                      </span>
                    ) : (
                      <MapPinIcon
                        aria-hidden
                        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
