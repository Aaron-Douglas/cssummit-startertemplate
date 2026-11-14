import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Container } from "@/components/container";
import { Game } from "@/components/game/game";
import { PageHeader } from "@/components/page-header";
import {
  WeatherAttribution,
  WeatherSourceNote,
} from "@/components/weather-attribution";
import { stormFromWeather } from "@/lib/game/storm";
import { getChicagoWeather } from "@/lib/weather";

export const metadata: Metadata = {
  title: "Play",
  description:
    "Rain Barrel: catch raindrops for the community garden and dodge the hail. Today's weather in the Loop sets the storm level.",
};

export default function PlayPage() {
  return (
    <Container className="flex flex-col gap-8 py-section">
      <PageHeader
        eyebrow="Play"
        title="Rain Barrel"
        description="A storm over the community garden, as wild as today's weather in the Loop. Catch the rain, dodge the hail. Scores are saved on this device."
      />
      <Suspense fallback={<GameSkeleton />}>
        <GameWithWeather />
      </Suspense>
      <WeatherAttribution />
    </Container>
  );
}

/**
 * Reads the Loop's weather when someone visits (not at build time) and turns it into today's
 * storm level. Only the game settings reach the browser.
 */
async function GameWithWeather() {
  await connection();
  const report = await getChicagoWeather();
  const loop = report.neighborhoods.find((spot) => spot.id === "loop");
  // The Loop is always in the list; this only guards against someone removing it.
  const storm = loop ? stormFromWeather(loop) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {storm ? (
          <p className="text-lg font-medium">
            Today in the Loop: {storm.summary} → storm level {storm.level}
          </p>
        ) : null}
        <WeatherSourceNote report={report} />
      </div>
      <Game tuning={storm?.tuning} />
    </div>
  );
}

function GameSkeleton() {
  return (
    <div
      aria-hidden
      className="surface mx-auto aspect-[4/5] w-full max-w-[min(100%,calc((100dvh-18rem)*0.8))] animate-pulse rounded-card"
    />
  );
}
