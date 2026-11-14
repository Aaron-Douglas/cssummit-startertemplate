"use client";

import {
  CopyIcon,
  PaletteIcon,
  RotateCcwIcon,
  ShuffleIcon,
  XIcon,
} from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AXES,
  AXIS_LABELS,
  AXIS_NAMES,
  type Axis,
  DESIGN_COOKIE,
  type Design,
  designConfigSource,
  isAxisOption,
  matchPreset,
  PRESET_NAMES,
  PRESETS,
  type PresetName,
  serializeDesignCookie,
  shuffleDesign,
} from "@/lib/design";
import { cn } from "@/lib/utils";

const ONE_YEAR = 60 * 60 * 24 * 365;

function readFromHtml(fallback: Design): Design {
  const html = document.documentElement;
  const design = { ...fallback } as Record<Axis, string>;
  for (const axis of AXIS_NAMES) {
    const value = html.getAttribute(`data-${axis}`);
    if (isAxisOption(axis, value)) design[axis] = value;
  }
  return design as Design;
}

function applyToHtml(design: Design) {
  const html = document.documentElement;
  for (const axis of AXIS_NAMES)
    html.setAttribute(`data-${axis}`, design[axis]);
}

function writeCookie(design: Design | null) {
  // biome-ignore lint/suspicious/noDocumentCookie: a plain first-party preference cookie, read by the inline script in app/layout.tsx
  document.cookie = design
    ? `${DESIGN_COOKIE}=${serializeDesignCookie(design)}; path=/; max-age=${ONE_YEAR}; SameSite=Lax`
    : `${DESIGN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

/**
 * The live design switcher: a floating, non-modal panel to flip every design axis, apply a
 * preset, Shuffle, Reset to design.config.ts, and copy a ready-to-paste design.config.ts.
 * The choice is kept in a cookie and applied before first paint by the script in the root
 * layout. Rendered only when isDesignSwitcherEnabled() is true.
 */
export function DesignSwitcher({ configured }: { configured: Design }) {
  const [open, setOpen] = useState(false);
  const [design, setDesign] = useState<Design>(configured);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const panelId = useId();

  // The inline script may have applied a cookie before hydration: start from what <html> says.
  useEffect(() => {
    setDesign(readFromHtml(configured));
  }, [configured]);

  useEffect(() => {
    if (open) headingRef.current?.focus();
  }, [open]);

  const update = useCallback((next: Design) => {
    setDesign(next);
    applyToHtml(next);
    writeCookie(next);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  const reset = () => {
    setDesign(configured);
    applyToHtml(configured);
    writeCookie(null);
    toast("Back to design.config.ts");
  };

  const copyConfig = async () => {
    const source = designConfigSource(design);
    try {
      await navigator.clipboard.writeText(source);
      toast.success("Copied. Paste it into design.config.ts");
    } catch {
      toast.error("Could not reach the clipboard", {
        description: "Copy the values shown in this panel by hand instead.",
      });
    }
  };

  const preset = matchPreset(design);

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3">
      {open ? (
        <section
          id={panelId}
          aria-labelledby={`${panelId}-title`}
          onKeyDown={(event) => {
            if (event.key === "Escape") close();
          }}
          className="flex max-h-[min(40rem,calc(100dvh-6rem))] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-2xl"
        >
          <header className="flex items-center justify-between gap-2 border-b px-4 py-3">
            <h2
              ref={headingRef}
              id={`${panelId}-title`}
              tabIndex={-1}
              className="font-sans text-base font-semibold tracking-normal normal-case outline-none"
            >
              Design
              <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
                {preset ?? "custom"}
              </span>
            </h2>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={close}
              aria-label="Close design switcher"
            >
              <XIcon />
            </Button>
          </header>

          <div className="flex flex-col gap-5 overflow-y-auto px-4 py-4">
            <OptionGroup
              name="preset"
              label="Preset"
              options={PRESET_NAMES}
              value={preset}
              onChange={(value) => update({ ...PRESETS[value as PresetName] })}
            />
            <hr className="border-border" />
            {AXIS_NAMES.map((axis) => (
              <OptionGroup
                key={axis}
                name={axis}
                label={AXIS_LABELS[axis]}
                options={AXES[axis]}
                value={design[axis]}
                onChange={(value) =>
                  update({ ...design, [axis]: value } as Design)
                }
              />
            ))}
          </div>

          <footer className="grid grid-cols-[auto_auto_1fr] gap-2 border-t p-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => update(shuffleDesign())}
            >
              <ShuffleIcon />
              Shuffle
            </Button>
            <Button variant="secondary" size="sm" onClick={reset}>
              <RotateCcwIcon />
              Reset
            </Button>
            <Button size="sm" onClick={copyConfig}>
              <CopyIcon />
              Copy config
            </Button>
          </footer>
        </section>
      ) : null}

      <Button
        ref={toggleRef}
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className="shadow-xl"
      >
        <PaletteIcon />
        Design
      </Button>
    </div>
  );
}

function OptionGroup({
  name,
  label,
  options,
  value,
  onChange,
}: {
  name: string;
  label: string;
  options: readonly string[];
  value: string | undefined;
  onChange: (value: string) => void;
}) {
  const groupId = useId();
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 font-mono text-[0.6875rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {label}
      </legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const id = `${groupId}-${option}`;
          return (
            <div key={option}>
              <input
                type="radio"
                id={id}
                name={`${groupId}-${name}`}
                value={option}
                checked={value === option}
                onChange={() => onChange(option)}
                className="peer sr-only"
              />
              <label
                htmlFor={id}
                className={cn(
                  "inline-flex h-8 cursor-pointer items-center rounded-md border px-2.5 font-sans text-[0.8125rem] font-medium text-muted-foreground transition-colors select-none hover:text-foreground",
                  "peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground",
                  "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring",
                )}
              >
                {option}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
