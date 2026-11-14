"use client";

import { clearHighScores, useHighScores } from "@/lib/game/high-scores";
import { cn } from "@/lib/utils";

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

/** The top scores saved in this browser. `highlight` marks a row (the game just played). */
export function HighScoreTable({
  highlight = -1,
  className,
}: {
  highlight?: number;
  className?: string;
}) {
  const scores = useHighScores();

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
          High scores
        </h3>
        {scores?.length ? (
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm("Clear the high scores saved in this browser?")
              )
                clearHighScores();
            }}
            className="rounded-control text-xs text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/60"
          >
            Clear
          </button>
        ) : null}
      </div>
      {scores === null ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : scores.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No scores yet. Yours could be first.
        </p>
      ) : (
        <ol className="flex flex-col gap-1 text-sm">
          {scores.map((entry, index) => (
            <li
              key={`${entry.date}-${entry.score}`}
              className={cn(
                "flex items-center gap-3 rounded-field px-2 py-1",
                index === highlight && "bg-primary-tint text-primary-text",
              )}
            >
              <span className="w-5 font-mono text-muted-foreground">
                {index + 1}.
              </span>
              <span className="flex-1 font-mono font-semibold tabular-nums">
                {entry.score.toLocaleString("en-US")}
              </span>
              <span className="text-muted-foreground">
                {dateFormat.format(new Date(entry.date))}
              </span>
              {index === highlight ? (
                <span className="sr-only">(this game)</span>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
