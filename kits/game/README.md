# Game kit

**Rain Barrel**: a summer storm over a community garden. Slide the rain barrel to catch
raindrops, grab the rare golden drop, dodge the hail, and fill the barrel for bonus points and
an extra life. It is small on purpose, so your team can reshape it into your own idea.

```bash
pnpm kit add game
```

Then open `/play` (a "Play" nav link is added for you). No dependencies, no keys.

## Controls

- Keyboard: `←` `→` or `A` `D` to move, `P` or `Esc` to pause and resume.
- Touch or mouse: drag on the game, or hold the arrow buttons under it.
- The game pauses by itself when you switch tabs or windows.

## Where things are (read in this order)

| File | What it does | Change it to... |
|---|---|---|
| `lib/game/config.ts` | Every number: speeds, spawn rates, points, lives, barrel size | Make it easier, harder, faster. **Start here.** |
| `lib/game/world.ts` | The rules: spawning, movement, catching, getting hit, game over | Add a new item, a power-up, a different goal |
| `lib/game/render.ts` | Drawing on the canvas, and the colours (read from the design tokens) | Change how things look |
| `lib/game/engine.ts` | The fixed-timestep loop, pause/resume, keyboard/touch input | Rarely. It knows nothing about rain, so it fits any game |
| `lib/game/high-scores.ts` | Top 5 scores in this browser's localStorage | Swap for a database for a shared leaderboard |
| `components/game/game.tsx` | Wires it together: canvas, score bar, start / paused / game-over screens | Change the screens and text |

### Ideas for reshaping it

- **New theme:** recycling sorting, catching bus tickets, collecting books for a library.
  Rename things in `config.items`, redraw them in `render.ts`.
- **New item:** add an entry to `config.items` (with a `weight`), handle it in `stepWorld()`
  in `world.ts`, and give it a shape in `drawItem()` in `render.ts`.
- **Questions:** pause when a golden drop is caught and ask a quiz question (see the
  `learning` kit).

## Design

The canvas reads its colours from the site's CSS tokens at runtime (`--card`, `--primary`,
`--chart-2`, `--chart-4`, `--destructive`...) with `getComputedStyle`, and re-reads them when
the design switcher changes the look. The barrel's corners follow the shape option. Items differ
by shape as well as colour (teardrop, rayed drop, jagged hailstone).

It respects `prefers-reduced-motion` (no screen shake, particles or blinking), stays sharp on
high-DPI screens, and fits a 375px-wide phone.
