import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Container } from "@/components/container";
import { MapExplorer } from "@/components/map/map-explorer";
import { PageHeader } from "@/components/page-header";
import {
  WeatherAttribution,
  WeatherSourceNote,
} from "@/components/weather-attribution";
import { placesFromWeather } from "@/lib/map/places";
import { getChicagoWeather } from "@/lib/weather";

export const metadata: Metadata = {
  title: "Chicago right now",
  description:
    "Current weather in eight Chicago neighborhoods on a map, from Open-Meteo.",
};

/** The map page. The weather comes from lib/weather.ts; the map itself loads in the browser. */
export default function MapPage() {
  return (
    <Container className="flex flex-col gap-10 py-section">
      <PageHeader
        eyebrow="Map"
        title="Storm Watch: Chicago right now"
        description="The weather in eight neighborhoods. Filter by sky, tap a neighborhood to see temperature, wind and rain, or sort by distance from you."
      />
      <Suspense fallback={<MapSkeleton />}>
        <MapWithWeather />
      </Suspense>
      <WeatherAttribution />
    </Container>
  );
}

/**
 * Fetches the weather when someone visits (not at build time): `connection()` tells Next.js
 * to wait for a real request before running the rest.
 */
async function MapWithWeather() {
  await connection();
  const report = await getChicagoWeather();
  return (
    <div className="flex flex-col gap-stack">
      <WeatherSourceNote report={report} />
      <MapExplorer data={placesFromWeather(report)} />
    </div>
  );
}

function MapSkeleton() {
  return (
    <div aria-hidden className="surface h-[36rem] animate-pulse rounded-card" />
  );
}
