import type { DesignConfig } from "@/lib/design";

/**
 * This project's look: one option per axis. Matches the "soft" preset.
 * Options are listed in lib/design.ts (AXES). Preview combinations with the design switcher
 * (bottom-right corner in development), then paste its "Copy config" output here.
 */
const design: DesignConfig = {
  preset: "soft",
  shape: "pill",
  buttons: "solid",
  surface: "glass",
  type: "geist",
  layout: "centered",
  nav: "floating",
  density: "spacious",
  accent: "teal",
};

export default design;
