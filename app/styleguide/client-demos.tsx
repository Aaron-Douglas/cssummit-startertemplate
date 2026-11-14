"use client";

import { BellIcon } from "lucide-react";
import { useSyncExternalStore } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AXIS_LABELS,
  AXIS_NAMES,
  type Design,
  matchPreset,
} from "@/lib/design";

export function ToastDemo() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="outline"
        onClick={() =>
          toast("Project saved", { description: "Your changes are live." })
        }
      >
        <BellIcon />
        Show a toast
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.success("Deployed to your Vercel")}
      >
        Success toast
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.error("Could not reach Supabase")}
      >
        Error toast
      </Button>
    </div>
  );
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true });
  return () => observer.disconnect();
}

/** The design currently on <html>, live-updating as the switcher changes it. */
export function CurrentDesign({ configured }: { configured: Design }) {
  const snapshot = useSyncExternalStore(
    subscribe,
    () =>
      AXIS_NAMES.map(
        (axis) => document.documentElement.getAttribute(`data-${axis}`) ?? "",
      ).join("|"),
    () => AXIS_NAMES.map((axis) => configured[axis]).join("|"),
  );
  const values = snapshot.split("|");
  const design = Object.fromEntries(
    AXIS_NAMES.map((axis, i) => [axis, values[i]]),
  ) as Design;
  const preset = matchPreset(design);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Preset:{" "}
        <span className="font-mono text-foreground">
          {preset ?? "custom mix"}
        </span>
      </p>
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-card border bg-border sm:grid-cols-4">
        {AXIS_NAMES.map((axis) => (
          <div key={axis} className="flex flex-col gap-1 bg-background p-4">
            <dt className="font-mono text-xs text-muted-foreground uppercase">
              {AXIS_LABELS[axis]}
            </dt>
            <dd className="font-medium">{design[axis]}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
