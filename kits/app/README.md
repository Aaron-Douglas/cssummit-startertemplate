# App kit: sign-in + dashboard (Supabase)

Adds accounts to your project: sign up, sign in (email + password, magic link, optional
Google), a protected `/dashboard`, a `/dashboard/profile` page and sign-out.

```bash
pnpm kit add app
```

Until you connect a Supabase project the kit runs in **demo mode**: the sign-in pages show a
notice with the forms switched off, and `/dashboard` shows pretend data labelled "Demo".
Nothing breaks, so you can deploy before setting anything up.

The fastest way to connect: run `/setup` in Claude Code. Or follow the steps below.

## What it adds

| Path | What it is |
|---|---|
| `app/login`, `app/signup` | Sign-in and sign-up pages |
| `app/auth/actions.ts` | Server Actions: sign in, sign up, magic link, Google, sign out |
| `app/auth/callback/route.ts` | Where email links and Google send people back (swaps a `code` for a session) |
| `app/auth/confirm/route.ts` | Same, for email templates that send a `token_hash` |
| `app/dashboard/` | The protected area: layout with a menu, overview page, profile page + its action |
| `components/app/` | Forms, setup notice, dashboard menu, sign-out button |
| `lib/supabase/` | Supabase clients (`client.ts` browser, `server.ts` server), `proxy.ts` session refresh, `auth.ts` (`getCurrentUser()`, `requireUser()`) |
| `proxy.ts` | Runs before each page: refreshes the session and sends signed-out visitors from `/dashboard/**` to `/login` |
| `supabase/migrations/*_profiles.sql` | The `profiles` table, its Row Level Security and the signup trigger |

## Connect your own Supabase project

Use **your team's own** Supabase account, not an organiser's or anyone else's. The free plan
is enough for a hackathon.

1. **Create a project.** Sign in at <https://supabase.com/dashboard>, click **New project**,
   pick your own organisation, a name and a database password (save it in a password
   manager). Wait a minute for it to start.
2. **Copy the two public values.** In the project, open **Project Settings > API** (or the
   **Connect** button). Copy the **Project URL** and the **publishable key**
   (starts with `sb_publishable_`).
3. **Put them in `.env.local`** (in the project root, never committed):

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

   Do **not** use the secret / service-role key: this kit never needs it, and it must never
   go in a `NEXT_PUBLIC_` variable.
4. **Apply the migration.** Open **SQL Editor > New query**, paste the whole of
   `supabase/migrations/<timestamp>_profiles.sql`, and click **Run**. (Or ask Claude Code to
   apply it with the Supabase MCP after you have signed in to your own account through
   `/mcp`.) Then open **Advisors > Security Advisor** and check that nothing new is flagged
   for `profiles`.
5. **Set the redirect URLs.** In **Authentication > URL Configuration**:
   - **Site URL**: your deployed site, e.g. `https://your-project.vercel.app`
     (use `http://localhost:3000` until you deploy).
   - **Redirect URLs**: add
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/auth/confirm`
     - `https://your-project.vercel.app/auth/callback`
     - `https://your-project.vercel.app/auth/confirm`

     For Vercel preview deployments you can add a wildcard such as
     `https://*-your-team.vercel.app/**`.
6. **Restart** `pnpm dev`. The demo notices disappear. Sign up at `/signup`.

On Vercel, add the same two variables under **Project > Settings > Environment Variables**,
then redeploy (`NEXT_PUBLIC_` values are baked in at build time).

### Email confirmation

By default Supabase asks new users to confirm their email. The sign-up form then says
"check your email", and the link lands on `/auth/callback`. For a quick demo you can turn
it off in **Authentication > Sign In / Providers > Email > Confirm email**: sign-up then
signs the user straight in. Supabase's built-in email sender is rate-limited (a few emails
an hour), so test with real inboxes sparingly.

The default email templates work with `/auth/callback`. If you edit a template to link
straight to your site, use `/auth/confirm`, for example:
`{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard`.

### Google sign-in (optional)

1. Create an OAuth client in Google Cloud Console (APIs & Services > Credentials > OAuth
   client ID, type "Web application"). Add the **Callback URL** Supabase shows on its Google
   provider page as an authorised redirect URI.
2. In Supabase, **Authentication > Sign In / Providers > Google**: enable it and paste the
   client ID and secret.
3. Add `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true` to `.env.local` (and Vercel), then restart.
   The "Continue with Google" button appears only when this is `true`.

## Build on it

- **Your feature goes in `app/dashboard/page.tsx`.** Read the user on the server with
  `requireUser()` from `@/lib/supabase/auth`, inside `<Suspense>` (this project has
  `cacheComponents` on, so anything that reads cookies must be inside a Suspense boundary).
- **New table?** Write a new migration in `supabase/migrations/` with
  `enable row level security` and policies in the same file (see `.claude/rules/database.md`).
  Never edit a migration that has already been applied.
- **More protected pages?** Anything under `/dashboard/` is protected already. For other
  paths, add them to `PROTECTED_PREFIXES` in `lib/supabase/proxy.ts` and call
  `requireUser()` in the page.
- **Browser code** (Client Components) uses `createClient()` from `@/lib/supabase/client`.
  Server code uses `createClient()` from `@/lib/supabase/server`. Both return `null` in
  demo mode, so check before using them.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Still says "Demo mode" | Both variables set in `.env.local`? Restart `pnpm dev` after editing it. |
| "That sign-in link didn't work" | The link expired or was opened twice, or its URL is not in **Redirect URLs**. |
| Sign-up works but the profile page can't save | The migration was not applied. Run step 4. |
| Google button does nothing useful | The provider is not enabled in Supabase, or the redirect URI in Google Cloud is wrong. |
