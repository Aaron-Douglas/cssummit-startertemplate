import { CloudOffIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatAsOf, type WeatherReport } from "@/lib/weather-data";

/**
 * The credit line Open-Meteo's licence (CC BY 4.0) asks for. Put it on every page that shows
 * their weather data, and do not hide it.
 */
export function WeatherAttribution({ className }: { className?: string }) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      Weather data by{" "}
      <a
        href="https://open-meteo.com"
        target="_blank"
        rel="noreferrer"
        className="underline underline-offset-4 hover:text-foreground"
      >
        Open-Meteo.com
      </a>
    </p>
  );
}

/**
 * Says where the numbers came from: "Live · as of 12:15 PM", or a warning when the app fell
 * back to made-up sample readings. Show it next to anything that displays weather.
 */
export function WeatherSourceNote({
  report,
  className,
}: {
  report: Pick<WeatherReport, "source" | "asOf">;
  className?: string;
}) {
  if (report.source === "sample") {
    return (
      <p
        className={cn(
          "inline-flex w-fit items-center gap-2 rounded-control border border-warning/40 bg-warning/15 px-3 py-1.5 text-sm font-medium text-warning",
          className,
        )}
      >
        <CloudOffIcon aria-hidden className="size-4" />
        Sample data (live weather unavailable)
      </p>
    );
  }
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      Live · as of {formatAsOf(report.asOf)} Chicago time
    </p>
  );
}
