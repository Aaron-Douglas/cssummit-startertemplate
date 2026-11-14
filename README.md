# Black CS Success Summit — Starter Template

A starter for your hackathon project. Clone it, pick what you are building, pick a look, and start on your idea instead of on setup.

## What you get

- A working home page in the summit's dark theme, ready to rewrite for your audience.
- A UI kit (buttons, cards, forms, menus) you can see at `/styleguide`.
- A design system you can switch in one file, so your project does not look like everyone else's.
- Seven optional **kits**, one for each kind of project: website, app, chatbot, game, dashboard, map, learning. You add only the one you need.
- Claude Code set up for this project, with three helpers: `/start`, `/design` and `/setup`.

Built with Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Biome and pnpm.

## Quick start (5 minutes)

You need [Node.js](https://nodejs.org) **22.6 or newer** (the LTS download is fine; check with `node --version`) and [pnpm](https://pnpm.io/installation) (`npm install -g pnpm`). The `pnpm start-project` wizard does not run on older Node versions.

```bash
git clone <this-repo-url> my-project
cd my-project
pnpm install
pnpm start-project
pnpm dev
```

Open http://localhost:3000.

`pnpm start-project` asks three things: your project name, which kit, and which design. You can also pass answers as flags:

```bash
pnpm start-project --name "Block Club Finder" --kits map --design soft --yes
```

| Flag | Meaning |
|---|---|
| `--name "<name>"` | Project name (written to `lib/site.ts` and `package.json`) |
| `--kits a,b` | Kits to add, comma-separated. `--kits none` adds none |
| `--design <preset>` | A preset name, or `shuffle` for a random look |
| `--yes` | Don't ask questions; use only the flags |
| `--prune` | Delete the kit folders you didn't pick (you can't add them later without the original template) |
| `--skip-install` | Don't run `pnpm add` for kit packages |

`pnpm start-project --help` prints the same list.

## Pick a kit

Pick **one** kit. Two at most. Every extra kit is more code to understand and less time for your idea.

| Kit | Build this if… | What it adds | Pages | Needs an account? |
|---|---|---|---|---|
| `website` | You want to share information, resources or events | About, contact and updates pages | `/about`, `/contact`, `/updates` | No |
| `app` | People need to sign up and save things | Sign-up, login, a protected dashboard, profile page | `/login`, `/signup`, `/dashboard`, `/dashboard/profile` | Your own Supabase project (works in demo mode without it) |
| `chatbot` | People ask questions and get guided answers | Chat page using the Claude API | `/chat` | Your own Anthropic API key (gives demo replies without it) |
| `game` | You want to teach or engage through play | Game loop, keyboard/touch controls, score, high scores | `/play` | No |
| `dashboard` | You want to show data about a place or issue | Stat tiles, charts, sortable table | `/insights` | No |
| `map` | Your idea is about places, resources or routes | Map of Chicago with markers and popups | `/map` | No |
| `learning` | You want to teach something step by step | Lessons, quizzes, progress tracking | `/learn` | No |

Note the names: the `app` kit's signed-in area is `/dashboard`; the `dashboard` kit's charts page is `/insights`.

```bash
pnpm kit list               # see all kits and what is installed
pnpm kit add map            # add a kit later (or several: pnpm kit add map website)
pnpm kit add map --force    # overwrite files you already have
```

Kits live in `kits/` and are not part of your app until you add them. Each kit folder has its own `README.md` (for example `kits/map/README.md`) explaining what it adds and what to edit first. The rules for writing a kit are in `kits/README.md`.

## Pick a design

Your look is one choice per **axis**, saved in `design.config.ts`:

| Axis | Options | Changes |
|---|---|---|
| `shape` | sharp, soft, round, pill | How rounded corners are |
| `buttons` | offset, solid, outline, glow, brutal | Button style and hover effect |
| `surface` | raised, flat, bordered, glass | How cards and panels look |
| `type` | geist, editorial, mono, display | Fonts for headings and text |
| `layout` | split, centered, editorial, bento | Home page layout |
| `nav` | bar, floating, sidebar | Site navigation |
| `density` | compact, comfortable, spacious | Spacing |
| `accent` | orange, teal, green, yellow | Main highlight colour |

Presets set every axis at once: `summit` (default), `brutalist`, `soft`, `editorial`, `terminal`, `bento`.

`design.config.ts` holds an optional `preset` plus any axis values. Axis values win over the preset, so this is the `soft` preset with orange as the accent:

```ts
import type { DesignConfig } from "@/lib/design";

const design: DesignConfig = {
  preset: "soft",
  accent: "orange",
};

export default design;
```

The options and presets are defined in `lib/design.ts`.

**Design switcher:** while `pnpm dev` is running, a **Design** button in the bottom-right corner opens a panel that changes every axis live. Press **Shuffle** for a random look. When you like it, press **Copy config** and replace the contents of `design.config.ts` with it. The switcher's choice is only saved in your browser; `design.config.ts` is what everyone else sees. To show the panel on your deployed site too, set `NEXT_PUBLIC_DESIGN_SWITCHER=true`.

Check `/styleguide` to see every component in your current design.

Rule for your code: use the theme's colour names (`bg-background`, `text-foreground`, `bg-card`, `bg-primary`, `text-muted-foreground`, `border-border`). Do not type hex colours or pixel radii into components. That way a design change updates everything.

## Working with Claude Code

Open this folder in [Claude Code](https://claude.com/claude-code) and type:

| Command | What it does |
|---|---|
| `/start` | Asks who your project is for and what it does, suggests a kit and a design, and sets up the project |
| `/design` | Changes the look: "switch to brutalist", "pill buttons", "invent a new preset called westside" |
| `/setup` | Walks you through connecting your own Supabase, Anthropic and Vercel accounts |

Claude reads `AGENTS.md` at the start of every session. It explains the project rules, so you do not have to repeat them.

Claude will ask before running most commands. It is set up to run `pnpm dev`, `pnpm verify` and the kit commands without asking, and it is blocked from reading your `.env.local` file.

## Connect your own accounts

You only need this for the `app` kit, the `chatbot` kit, or to deploy. Run `/setup` in Claude Code for a guided version.

**Use your own accounts.** Do not use a key or project from someone else, from another project, or from the organisers. You sign in yourself, and you paste keys yourself. Never paste a key into a chat.

The full step-by-step guides are in the kit folders: **`kits/app/README.md`** (Supabase, redirect URLs, Google sign-in) and **`kits/chatbot/README.md`** (Anthropic key, cost, spend limits). The short version:

1. Copy `.env.example` to `.env.local`. This file stays on your computer; git ignores it. (`pnpm kit add` lists each kit's variables in `.env.example`.)
2. **Supabase** (`app` kit): create a free project at [supabase.com](https://supabase.com/dashboard). From **Project Settings → API Keys** (or the **Connect** button), put the Project URL and the **publishable** key in `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Then paste `supabase/migrations/20261114000000_profiles.sql` into the Supabase **SQL Editor** and run it, and add your redirect URLs (see `kits/app/README.md`). Never put the secret / service-role key in a `NEXT_PUBLIC_` variable.
3. **Google sign-in** (optional): set it up under **Authentication → Sign In / Providers → Google** in Supabase, then set `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true`.
4. **Anthropic** (`chatbot` kit): create a key at [platform.claude.com](https://platform.claude.com), set a low spend limit, and put it in `.env.local` as `ANTHROPIC_API_KEY`. `ANTHROPIC_MODEL` is optional.
5. Restart `pnpm dev`.

Claude Code can also talk to Supabase and Vercel for you (see `.mcp.json`). Type `/mcp`, pick the service and sign in with **your** account in the browser. No keys are stored in the repo.

## Deploy to your own Vercel

Deploy early, then keep deploying. A live URL is part of your submission.

1. Run `pnpm verify`. It must pass.
2. Push your project to your own GitHub account.
3. Sign in at [vercel.com](https://vercel.com) (the free Hobby plan is enough), click **Add New → Project**, and import your repo.
4. In **Settings → Environment Variables**, add the same variables you have in `.env.local`. Redeploy.
5. Using Supabase sign-in? Add your Vercel URL under **Auth → URL Configuration** in Supabase.

## Deploy to your own Cloudflare

Cloudflare Workers is the other option (the free plan is enough). You deploy from your own computer with Cloudflare's `wrangler` tool, which comes with this project. The app is built for Workers by the [OpenNext adapter](https://opennext.js.org/cloudflare); the settings are in `wrangler.jsonc` and `open-next.config.ts`.

1. Run `pnpm verify`. It must pass.
2. Sign in to **your own** Cloudflare account (create a free one at [dash.cloudflare.com](https://dash.cloudflare.com/sign-up) if needed): `pnpm exec wrangler login`. It opens your browser. Check who you are signed in as with `pnpm exec wrangler whoami`.
3. Pick a name for your worker: change `"name"` in `wrangler.jsonc` (and the `"service"` line below it to the same name). The name becomes your URL.
4. Deploy: `pnpm cf:deploy`. It builds the app and prints your URL, `https://<name>.<your-subdomain>.workers.dev`. If your account has no `workers.dev` subdomain yet, wrangler asks you to pick one.
5. Server-only keys (no `NEXT_PUBLIC_`), for example the chatbot's key: `pnpm exec wrangler secret put ANTHROPIC_API_KEY`, then paste the value when it asks. It goes straight to Cloudflare, never into the repo. Do the same for `ANTHROPIC_MODEL` or `SUPABASE_SECRET_KEY` if you use them. They take effect straight away, no rebuild.
6. `NEXT_PUBLIC_` values (Supabase URL and publishable key, `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED`, `NEXT_PUBLIC_DESIGN_SWITCHER`, `NEXT_PUBLIC_SITE_URL`) are **baked in when you build**, so `wrangler secret put` does not change them. Put them in `.env.local` before you run `pnpm cf:deploy`, and run it again after you change one. Set `NEXT_PUBLIC_SITE_URL` to your `workers.dev` URL so share cards point at it.
7. Using Supabase sign-in? Add your `workers.dev` URL under **Auth → URL Configuration** in Supabase.

Good to know:

- `pnpm cf:build` then `pnpm cf:preview` runs the Cloudflare build on your computer at http://localhost:8787 before you deploy.
- The Cloudflare build turns off Next's `cacheComponents` (partial prerendering) because the adapter cannot run it on Workers yet; `next.config.ts` explains. Pages look and behave the same; pages with a loading state are rendered on each request instead of from a saved shell. Write your code as usual: `pnpm verify` still checks it with `cacheComponents` on.
- The build also copies the values in `.env.local` into the worker it uploads (only to your Cloudflare account, never to git). Prefer `wrangler secret put` for keys anyway, so you can change them without rebuilding.
- **Windows:** this project's `.npmrc` sets `node-linker=hoisted` so the Cloudflare build can run on Windows without admin rights. If `pnpm cf:build` still fails with `EPERM: operation not permitted, symlink`, turn on **Developer Mode** (Windows Settings → System → For developers) or build in WSL.

## Submission checklist

- [ ] Your live URL (Vercel or Cloudflare) opens and the main pages work.
- [ ] `pnpm verify` passes.
- [ ] No passwords, API keys or tokens anywhere in the repo. `.env.local` is not committed. (Check with `git status` before you push.)
- [ ] The home page says who the project is for and what problem it solves.
- [ ] You changed the name, tagline and links in `lib/site.ts`.

## Project tour

```
app/                    Pages and routes. Starts with the home page and /styleguide.
components/ui/          Buttons, cards, inputs and more (shadcn/ui). You can edit them.
components/landing/     Home page sections. hero/ has one file per layout option.
components/nav/         Navigation, one file per nav option.
lib/site.ts             Project name, tagline, links. Change this first.
lib/design.ts           Design axes, options and presets.
lib/env.ts              The only place code reads environment variables.
design.config.ts        Your chosen design.
styles/design/          CSS for each design axis.
kits/                   Optional kits. Not in your app until you add one.
kits.installed.json     Which kits you added.
scripts/                The kit and start-project commands.
.env.example            List of environment variables (no values).
AGENTS.md, CLAUDE.md    Instructions for Claude Code and other AI coding tools.
.claude/                Claude Code skills, rules and settings for this project.
```

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Start the dev server at http://localhost:3000 |
| `pnpm verify` | Lint and format check (Biome), route types, typecheck, then the production build |
| `pnpm build` | Production build only (what Vercel runs) |
| `pnpm cf:build` | Build for Cloudflare Workers (into `.open-next/`) |
| `pnpm cf:preview` | Run that Cloudflare build locally at http://localhost:8787 |
| `pnpm cf:deploy` | Build and deploy to your own Cloudflare account |
| `pnpm start-project` | First-run wizard: name, kit, design (`--help` for flags) |
| `pnpm kit list` | Show kits |
| `pnpm kit add <name>` | Add a kit |

## Demo deployment (maintainers)

The public demo shows every kit and the design switcher, and runs on Cloudflare Workers as the worker `cssummit-starter-template`. Deploy it from a clean checkout of `main`, signed in to the organisers' Cloudflare account:

```bash
pnpm install --frozen-lockfile
pnpm exec wrangler login          # once per machine; check with: pnpm exec wrangler whoami
pnpm cf:deploy:demo
git checkout -- . && git clean -fd   # undo the kits it added (removes untracked files; git-ignored ones like .env.local stay)
```

- `pnpm cf:deploy:demo` runs `pnpm cf:build:demo` (`scripts/cf-build.mjs`: `pnpm kit add --all`, then the OpenNext build with `NEXT_PUBLIC_DESIGN_SWITCHER=true`), then `opennextjs-cloudflare deploy`. It never prompts, so it works in CI. Build it from a checkout with **no** `.env.local`: the `app` and `chatbot` kits then run in demo mode, and nothing secret is bundled. To preview first: `pnpm cf:build:demo && pnpm cf:preview`.
- Optional: `NEXT_PUBLIC_SITE_URL=https://<the workers.dev URL>` in the build environment, so share cards use the real URL.

The Vercel build still works and is kept as an option: build command `pnpm build:demo` (`pnpm kit add --all`, then `next build`) with the environment variable `NEXT_PUBLIC_DESIGN_SWITCHER=true`. Vercel's normal frozen-lockfile install runs first; the build step then adds the kit packages.

Learners' projects keep the normal `pnpm build` / `pnpm cf:build`. Don't commit the result of `pnpm kit add --all` back to the template.
