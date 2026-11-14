---
name: setup
description: Walk the learner through connecting their OWN accounts - Supabase for the app kit, an Anthropic API key for the chatbot kit, and Vercel for deploying. The learner signs in and pastes secrets themselves; never ask for secrets in chat. Use when a team wants real sign-in, a real chatbot, or a live URL.
argument-hint: "[supabase | google | anthropic | vercel]"
---

# Connect your own accounts

Read "Accounts are yours" in `AGENTS.md` before you start. It applies to every step.

Ground rules for this whole walkthrough:

- The learner does every sign-in and every paste of a secret. You give the steps and check the result.
- **Never ask for a key, password or token in chat.** If the learner pastes one anyway, tell them to rotate it and do not repeat it.
- Never use a project ref, key or account you find elsewhere on this machine.
- Before anything is created, say what it is and what it costs. Supabase and Vercel free tiers are enough for a hackathon. The Anthropic API is paid per use; the learner should set a low spend limit.
- If an MCP shows more than one organisation or team, ask which one belongs to the learner.

Check what is installed first: read `kits.installed.json`. Only do the sections that apply. If `$ARGUMENTS` names one section, do just that one.

The kits' own READMEs are the detailed reference and the learner can follow them without you: **`kits/app/README.md`** (Supabase project, keys, migration, redirect URLs, Google, troubleshooting) and **`kits/chatbot/README.md`** (Anthropic key, cost, spend limit, errors). Read the relevant one before you start and point the learner to it.

## A. Supabase (app kit)

1. The learner signs in at https://supabase.com/dashboard with their own account and creates a new project on the **Free** plan. They pick a region near Chicago (for example US East) and save the database password in their password manager. If you use the Supabase MCP `create_project`, first show the cost it reports and wait for a yes.
2. Create `.env.local` from the example if it does not exist: copy `.env.example` to `.env.local`. Do not open `.env.local` afterwards.
3. The learner opens **Project Settings → API Keys** (or the **Connect** button) and pastes into `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` = the Project URL
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = the publishable key (`sb_publishable_...`), or the legacy `anon` key if that is all they see
   They must **not** paste the secret / service-role key here.
4. Apply the migration `supabase/migrations/20261114000000_profiles.sql` (the `profiles` table, its RLS policies and the sign-up trigger). Either:
   - Supabase MCP: run `/mcp`, authenticate `supabase` with their own account, confirm the project by name, then `apply_migration` with the file contents; or
   - the learner pastes the file into the dashboard **SQL Editor** and runs it.
   Then check with `list_tables` (or the Table Editor) that the tables exist, and run `get_advisors` (security). Fix anything it reports with a new migration.
5. **Authentication → URL Configuration**: Site URL `http://localhost:3000` for now. Redirect URLs: `http://localhost:3000/auth/callback` and `http://localhost:3000/auth/confirm`; after deploying, add the same two paths on the Vercel URL (`https://<their-app>.vercel.app/auth/callback`, `/auth/confirm`) and change the Site URL to it.
6. Restart `pnpm dev`. The demo-mode notice should disappear and sign-up at `/signup` should work; signed-in users land on `/dashboard`. Ask the learner to try it and tell you what they see.

### Optional: Google sign-in

1. The learner creates an OAuth client in their own Google Cloud console (**APIs & Services → Credentials → OAuth client ID → Web application**).
2. Authorised redirect URI: the callback URL shown in Supabase under **Auth → Sign In / Providers → Google**.
3. They paste the Google client ID and secret into that Supabase page (not into the repo) and enable the provider.
4. Set `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true` in `.env.local` (and later in Vercel).

## B. Anthropic API key (chatbot kit)

1. The learner signs in at https://platform.claude.com with their own account, adds credit under **Billing**, and sets a low monthly spend limit under **Limits**.
2. They create a key under **API keys** and paste it into `.env.local` as `ANTHROPIC_API_KEY=...`. It has no `NEXT_PUBLIC_` prefix on purpose: it must stay on the server. `ANTHROPIC_MODEL` is optional (empty uses the kit's default model).
3. Restart `pnpm dev`, open `/chat` and ask them to send a test message. Without the key the chatbot gives canned replies marked "Demo", which is fine for a demo but must not be presented as the bot's real output. Error messages and fixes are in `kits/chatbot/README.md`.

## C. Deploy to Vercel

1. Run `pnpm verify` first. Do not deploy a failing build.
2. The learner pushes the repo to their own GitHub account. Before they push, check `git status` and `git diff --cached` for secrets. `.env.local` must not be tracked.
3. The learner signs in at https://vercel.com with their own account (Hobby plan is free), clicks **Add New → Project**, and imports their repo. Framework: Next.js. No other settings needed.
   - Alternative: Vercel MCP (`/mcp` → `vercel`, authenticated with their own account) or `vercel deploy` after they run `vercel login` themselves.
4. In **Project → Settings → Environment Variables**, the learner adds the same variables as in `.env.local` (only the ones their kits need), then redeploys.
5. Open the production URL with them and check the main pages. If they use Supabase auth, add the URL to Supabase Redirect URLs and Site URL (step A5).

`NEXT_PUBLIC_` values are baked in at build time, so after changing one in Vercel the learner must redeploy.

## Finish

Summarise: which accounts are connected, which env vars are set (names only), the live URL, and anything still in demo mode. Remind them: the submission needs a working URL and no secrets in the repo.
