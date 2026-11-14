"use client";

import { CheckCircle2Icon, CircleIcon, RotateCcwIcon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { resetProgress, useProgress } from "@/lib/learning/progress";

/**
 * "2 of 3 lessons complete" with a bar and a reset button. Until progress has loaded in the
 * browser it shows a neutral placeholder of the same size, so nothing jumps or mismatches.
 */
export function ProgressSummary({ slugs }: { slugs: string[] }) {
  const progress = useProgress();
  const done = progress ? slugs.filter((slug) => progress[slug]).length : 0;
  const total = slugs.length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="surface flex flex-col gap-4 rounded-card p-card sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <p className="text-sm font-medium" aria-live="polite">
          {progress === null
            ? "Loading your progress…"
            : `${done} of ${total} lessons complete`}
        </p>
        <div
          role="progressbar"
          aria-label="Lessons complete"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={done}
          className="h-2 overflow-hidden rounded-badge bg-muted"
        >
          <div
            className="h-full rounded-badge bg-primary transition-[width] motion-reduce:transition-none"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!progress || done === 0}
        onClick={() => {
          if (window.confirm("Reset your progress on every lesson?")) {
            resetProgress();
            toast("Progress reset");
          }
        }}
      >
        <RotateCcwIcon />
        Reset progress
      </Button>
    </div>
  );
}

/** A badge for one lesson: "Not started" or "Done · 3/3". */
export function LessonStatus({ slug }: { slug: string }) {
  const progress = useProgress();
  const entry = progress?.[slug];

  if (!entry) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        <CircleIcon aria-hidden />
        {progress === null ? "…" : "Not started"}
      </Badge>
    );
  }
  return (
    <Badge variant="success">
      <CheckCircle2Icon aria-hidden />
      Done · {entry.bestScore}/{entry.total}
    </Badge>
  );
}
