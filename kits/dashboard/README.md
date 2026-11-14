# Dashboard kit

Adds an **Insights** page at `/insights`: four stat tiles with change indicators, three charts
(attendance over time, a topic breakdown, attendees by neighborhood) and a table you can
search, filter and sort. Everything is calculated from **one sample data file**.

```bash
pnpm kit add dashboard
pnpm dev            # open http://localhost:3000/insights
```

The sample data is made up: free tech workshops in six Chicago neighborhoods. No real people,
events or numbers. A notice on the page says so; remove it when your data is real.

## What it adds

| File | What it is |
|---|---|
| `lib/insights/data.ts` | **The data.** The `Session` type and the sample rows. Replace this. |
| `lib/insights/summary.ts` | Turns rows into tiles, monthly totals, groups and shares. Plain functions. |
| `app/insights/page.tsx` | The page. Server component: does the maths, passes results to the charts. |
| `components/insights/charts.tsx` | The three Recharts charts, tooltip and legend (client component). |
| `components/insights/chart-card.tsx` | Card around each chart with a one-line summary and a "Show the data" table. |
| `components/insights/stat-tile.tsx` | One stat with its change badge. |
| `components/insights/sessions-table.tsx` | Search, filters and sortable columns (client component). |

Dependency: [`recharts`](https://recharts.org) 3 (supports React 19). Nav link: **Insights**.
It does not touch `/dashboard`, so it installs alongside the `app` kit.

## Use your own data

1. Open `lib/insights/data.ts`. Each object in `sessions` is one row.
2. Replace the rows. From a spreadsheet: export CSV, then ask Claude Code
   "turn this CSV into the `sessions` array in lib/insights/data.ts".
3. Different columns? Change the `Session` type first. TypeScript (`pnpm typecheck`) then lists
   every line in `summary.ts` and the components that needs to follow.
4. Change `dataset.title`, `dataset.description` and `dataset.sampleNotice` (set the notice to
   real wording or delete the `<Alert>` in `app/insights/page.tsx`).

Loading from a database or API instead (for example Supabase from the `app` kit): keep the
`Session` type, write an `async function getSessions(): Promise<Session[]>`, and call it in
`app/insights/page.tsx`. Because `cacheComponents` is on, request-time data must render inside
`<Suspense>`; see `node_modules/next/dist/docs/` for "Cache Components".

## Design

- Colours come from the design tokens: series use `var(--chart-1)` … `var(--chart-5)`, grid
  and axes use `var(--border)` and `var(--muted-foreground)`, tooltips use the `surface` and
  `popover` tokens. Nothing is hard-coded, so the page follows every design preset.
- Accessibility: each chart has a sentence that states its main point, and "Show the data"
  opens the same numbers as a table. Change indicators say "up"/"down" for screen readers, not
  just a colour or arrow. Table headers are buttons with `aria-sort`.
- Up is shown green and down red. If "down" is good for one of your numbers (wait times, say),
  swap the classes for that tile in `stat-tile.tsx`.
