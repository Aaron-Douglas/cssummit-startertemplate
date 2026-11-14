/**
 * ─── TWEAK THE GAME HERE FIRST ───────────────────────────────────────────────────────────────
 * Every number that changes how the game feels. Change one, save, and play again.
 *
 * Units: positions and sizes are in "world units" (the game area is always `world.width` by
 * `world.height`, then scaled to fit the screen). Speeds are units per second. Times are seconds.
 *
 * The theme: a summer storm over a community garden. Slide the rain barrel to catch raindrops
 * for the garden, grab the rare golden drop, and dodge the hail. Fill the barrel for a bonus.
 * Want a different theme? Rename things in the `items` labels below and redraw them in
 * lib/game/render.ts. The rules live in lib/game/world.ts.
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 */
export const config = {
  /** The game area. 4:5 fits phones and laptops. */
  world: { width: 400, height: 500 },

  player: {
    width: 64,
    height: 44,
    /** How fast the barrel slides. */
    speed: 340,
    /** Gap between the barrel and the bottom edge. */
    bottomMargin: 18,
  },

  /** What falls from the sky. `weight` is how often each one appears compared to the others. */
  items: {
    drop: { label: "Raindrop", radius: 9, points: 10, weight: 70 },
    golden: { label: "Golden drop", radius: 11, points: 50, weight: 6 },
    hail: { label: "Hailstone", radius: 13, points: 0, weight: 24 },
  },

  /** Seconds between new items. It shrinks over time, down to `minInterval`. */
  spawn: { startInterval: 0.85, minInterval: 0.3, shrinkPerSecond: 0.01 },

  /** Falling speed. It grows over time, up to `maxSpeed`. Each item varies by ±`variation`. */
  fall: {
    startSpeed: 120,
    maxSpeed: 360,
    growPerSecond: 3,
    variation: 0.2,
  },

  lives: {
    start: 3,
    max: 5,
    /** After a hit, the barrel can't be hit again for this long. */
    safeSeconds: 1.2,
  },

  /** Catch drops in a row to raise the multiplier. Missing a drop resets it. */
  combo: { catchesPerStep: 5, maxMultiplier: 5 },

  /** Catching this many drops fills the barrel: bonus points and (if below max) a life back. */
  barrel: { capacity: 15, bonusPoints: 150 },

  /** How many scores to keep in this browser's high-score table. */
  highScores: { keep: 5 },
} as const;

export type ItemKind = keyof typeof config.items;
