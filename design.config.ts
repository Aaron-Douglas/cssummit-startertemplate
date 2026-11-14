import type { DesignConfig } from "@/lib/design";

/**
 * This project's look: one option per axis. Matches the "summit" preset.
 * Options are listed in lib/design.ts (AXES). Preview combinations with the design switcher
 * (bottom-right corner in development), then paste its "Copy config" output here.
 */
const design: DesignConfig = {
  preset: "summit",
  shape: "round",
  buttons: "offset",
  surface: "raised",
  type: "geist",
  layout: "split",
  nav: "bar",
  density: "comfortable",
  accent: "orange",
};

export default design;
