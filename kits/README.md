# Kits

A kit is an optional feature (a map, a chatbot, sign-in...) that stays in this folder until a
team adds it. The `kits/` folder is ignored by TypeScript, Biome and the Next build, so an
unadded kit costs nothing.

```bash
pnpm kit list               # what's available and what's installed
pnpm kit add map            # add one (or several: pnpm kit add map dashboard)
pnpm kit add map --force    # overwrite files that already exist
pnpm kit add --all          # every kit (the public demo build: pnpm build:demo)
pnpm start-project          # first-run wizard: name → kits → design
```

## The contract

```
kits/<name>/
  kit.json
  files/            mirrors the project root
    app/<route>/page.tsx      → app/<route>/page.tsx
    components/<name>/...     → components/<name>/...
    lib/<name>/...            → lib/<name>/...
```

### kit.json

```json
{
  "name": "map",
  "title": "Map",
  "description": "A Chicago map with markers and popups. No API key.",
  "dependencies": { "maplibre-gl": "^5.0.0" },
  "devDependencies": {},
  "env": [
    { "name": "NEXT_PUBLIC_EXAMPLE", "example": "", "comment": "What it is and where to get it" }
  ],
  "nav": [{ "label": "Map", "href": "/map" }],
  "next": "Edit data/places.geojson to put your own places on the map."
}
```

| Field | Required | Meaning |
|---|---|---|
| `name` | yes | Must equal the folder name. Lowercase, digits, dashes. |
| `title` | yes | Human name, shown by `pnpm kit list` and the wizard. |
| `description` | yes | One line. |
| `dependencies` / `devDependencies` | no | `{ package: version }`, installed with `pnpm add` when the kit is added. Pin a range (`^1.2.3`). |
| `env` | no | Variables appended to `.env.example` if missing: `name`, `example` (value written after `=`, keep it empty or a placeholder, never a real key), `comment` (lines above it). |
| `nav` | no | Links merged into the site nav (header, mobile menu, footer) through `kits.installed.json`. No code edit needed. |
| `next` | no | One or two sentences printed after install: what to edit first. |

### What `pnpm kit add <name>` does

1. Checks every file the kit would write. If a file exists with **different** content, it
   lists the conflicts and changes **nothing** (use `--force` to overwrite). Identical files are
   skipped, so re-adding a kit is safe.
2. Copies `files/**` into the project root and formats the copied code with the project's
   Biome config. A kit that is already in `kits.installed.json` is skipped (its files may
   have been edited since) unless `--force` is given.
3. Runs `pnpm add` for `dependencies` and `pnpm add -D` for `devDependencies`
   (`--skip-install` skips this).
4. Appends missing `env` entries to `.env.example` (creates it if absent).
5. Records `{ "name", "nav" }` in `kits.installed.json`, which `lib/site.ts` reads for the nav.
6. Prints the `next` note.

## Rules for kit authors

- **Self-contained.** A kit must build and run on its own (`pnpm kit add <name>` then
  `pnpm verify`) and alongside every other kit. Never write a file another kit writes; put
  your code under `app/<route>/`, `components/<kit-name>/`, `lib/<kit-name>/`.
- **Never overwrite core files** (`app/layout.tsx`, `app/page.tsx`, `lib/site.ts`, `lib/env.ts`,
  `components/ui/*`, `app/globals.css` ...). Nav links come from `kit.json`, not edits.
- **Works with no env vars.** Missing keys mean demo mode (sample data, a notice), never a
  crash and never a throw at import time. `pnpm verify` must pass with no `.env.local`.
- **Env vars are read only through `lib/env.ts`.** It already exposes:
  `publicEnv.supabaseUrl`, `publicEnv.supabasePublishableKey`, `publicEnv.authGoogleEnabled`,
  `publicEnv.siteUrl`, `isSupabaseConfigured()`, `isGoogleAuthEnabled()`, `getSiteUrl()`,
  and server-only `serverEnv().anthropicApiKey`, `serverEnv().anthropicModel`,
  `serverEnv().supabaseSecretKey`. For another server-only variable use
  `optionalServerEnv("NAME")`. List every variable in `kit.json` `env`.
- **Next 16.** App Router, `proxy.ts` (not middleware), async `params`/`searchParams`/`cookies()`.
  `cacheComponents` is on in `next.config.ts`: wrap request-time data (cookies, headers,
  uncached fetches) in `<Suspense>` or the build fails. Read `node_modules/next/dist/docs/`
  when unsure.
- **Style with tokens only.** No hex, rgb or Tailwind palette colours (`bg-blue-500`). Use the
  semantic classes below so the kit follows whatever design the team picked.

## What kits may use

### Layout components

```tsx
import { Container, Section } from "@/components/container";
import { PageHeader } from "@/components/page-header";

export default function MapPage() {
  return (
    <Container className="flex flex-col gap-10 py-section">
      <PageHeader eyebrow="Map" title="Places to study" description="Free, quiet, open late." />
      ...
    </Container>
  );
}
```

- `<Container size="page" | "narrow" | "full">`: page width (follows the layout axis) and
  gutters. `<Section>` is a `<section>` with `py-section`.
- `<PageHeader eyebrow title description actions as="h1"|"h2">`.
- `<Brand size="sm"|"md"|"lg" showName>` from `@/components/brand`.

### UI components (`@/components/ui/*`, shadcn/ui)

`button` (variants `default` `secondary` `outline` `ghost` `destructive` `link`; sizes
`sm` `default` `lg` `icon` `icon-sm` `icon-lg`), `card` (`Card` `CardHeader` `CardTitle`
`CardDescription` `CardAction` `CardContent` `CardFooter`, `size="sm"`), `input`, `textarea`,
`label`, `badge` (`default` `tint` `secondary` `outline` `success` `warning` `destructive`),
`alert` (`default` `info` `success` `destructive`), `separator`, `avatar`, `dropdown-menu`,
`sheet`, `sonner` (`import { toast } from "sonner"`; the `<Toaster />` is already mounted).
Icons: `lucide-react`. Class merging: `cn()` from `@/lib/utils`. Validation: `zod`.

A kit that needs another shadcn component should ship its own copy under
`components/<kit-name>/` rather than adding to `components/ui/` (two kits could clash).

### Colour classes (semantic tokens)

`bg-/text-/border-` + `background` `foreground` `card` `card-foreground` `popover`
`popover-foreground` `primary` `primary-foreground` `secondary` `secondary-foreground` `muted`
`muted-foreground` `accent` `accent-foreground` `destructive` `destructive-foreground`
`success` `success-foreground` `warning` `warning-foreground` `border` `input` `ring`
`chart-1` … `chart-5`, plus:

- `text-primary-text`: accent-coloured text that passes 4.5:1 on the page and cards (use this,
  not `text-primary`, for text).
- `bg-primary-tint`: soft accent background (pair with `text-primary-text` or `text-foreground`).
- `primary-shadow`: the accent's companion colour (the offset-shadow colour).

For canvas/SVG/chart libraries that need real colour values, read the CSS variables at runtime:
`getComputedStyle(document.documentElement).getPropertyValue("--chart-1")`, or pass
`"var(--chart-1)"` where the library accepts CSS colours.

### Design-system utilities

| Class | What it does |
|---|---|
| `eyebrow` | Mono uppercase label with the accent bar |
| `surface` | Card/panel treatment for the current surface option (bg, border, shadow, blur) |
| `text-display` | Hero-size heading |
| `font-sans` `font-heading` `font-mono` | Fonts of the current type option |
| `rounded-control` `rounded-field` `rounded-card` `rounded-badge` `rounded-avatar` | Radius per shape option (`rounded-sm`…`rounded-4xl` also scale with it) |
| `h-control` `h-control-sm` `h-control-lg` `px-control-x` | Control sizes per density option |
| `p-card` `gap-stack` `py-section` | Spacing per density option |
| `max-w-page` | Page width per layout option |
| `layout-split:` `layout-centered:` `layout-editorial:` `layout-bento:` | Variants for the layout axis |
| `nav-bar:` `nav-floating:` `nav-sidebar:` | Variants for the nav axis |

Headings (`h1`–`h4`) already pick up the type axis (font, weight, tracking, case), so don't
set `font-bold`/`tracking-*` on them unless you mean to override the design.

The page shell (header, footer, design switcher, toaster) comes from `app/layout.tsx`; a kit
page only renders its content.
