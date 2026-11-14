import { ArrowDownRightIcon, ArrowUpRightIcon, MinusIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Stat } from "@/lib/insights/summary";
import { cn } from "@/lib/utils";

/** One number with its change against the previous period. */
export function StatTile({ stat }: { stat: Stat }) {
  const { change } = stat;
  const Icon =
    change?.direction === "up"
      ? ArrowUpRightIcon
      : change?.direction === "down"
        ? ArrowDownRightIcon
        : MinusIcon;
  const words =
    change?.direction === "up"
      ? "up"
      : change?.direction === "down"
        ? "down"
        : "no change";

  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">{stat.label}</p>
        <p className="font-heading text-3xl font-semibold tabular-nums">
          {stat.value}
        </p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          {change ? (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-badge px-1.5 py-0.5 font-semibold tabular-nums",
                change.direction === "up" && "bg-success/15 text-success",
                change.direction === "down" &&
                  "bg-destructive/15 text-destructive",
                change.direction === "flat" && "bg-muted text-muted-foreground",
              )}
            >
              <Icon aria-hidden className="size-3.5" />
              <span className="sr-only">{words}</span>
              {change.direction === "flat" ? "0" : change.display}
            </span>
          ) : null}
          <span className="text-muted-foreground">{stat.hint}</span>
        </div>
      </CardContent>
    </Card>
  );
}
