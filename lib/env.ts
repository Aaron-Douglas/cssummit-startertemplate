/**
 * The one place environment variables are read.
 *
 * Rules:
 * - Every variable used anywhere is read here and listed in `.env.example`.
 * - Nothing throws at import time: a missing variable means "feature off" (demo mode), so the
 *   app builds and runs with no `.env.local` at all.
 * - `NEXT_PUBLIC_*` values must be written out literally (`process.env.NEXT_PUBLIC_X`) so Next
 *   can inline them into client code. Server-only values (no prefix) are never sent to the
 *   browser; only call `serverEnv()` / the server helpers from server code.
 */

function clean(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/** Public values, safe in client components. */
export const publicEnv = {
  siteUrl: clean(process.env.NEXT_PUBLIC_SITE_URL),
  designSwitcher: clean(process.env.NEXT_PUBLIC_DESIGN_SWITCHER),
  supabaseUrl: clean(process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabasePublishableKey: clean(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  ),
  authGoogleEnabled: clean(process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED),
} as const;

/** The site's absolute URL, for metadata and links in emails. Never throws. */
export function getSiteUrl(): URL {
  const candidates = [
    publicEnv.siteUrl,
    clean(process.env.VERCEL_PROJECT_PRODUCTION_URL),
    clean(process.env.VERCEL_URL),
  ];
  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      return new URL(
        candidate.startsWith("http") ? candidate : `https://${candidate}`,
      );
    } catch {
      // Ignore a malformed value and try the next one.
    }
  }
  return new URL("http://localhost:3000");
}

/** The live design switcher: always on in development, opt-in elsewhere. */
export function isDesignSwitcherEnabled(): boolean {
  return (
    publicEnv.designSwitcher === "true" ||
    process.env.NODE_ENV === "development"
  );
}

/** True when the team has connected their own Supabase project (the `app` kit). */
export function isSupabaseConfigured(): boolean {
  return Boolean(publicEnv.supabaseUrl && publicEnv.supabasePublishableKey);
}

export function isGoogleAuthEnabled(): boolean {
  return publicEnv.authGoogleEnabled === "true";
}

/**
 * Server-only values. Call this from server code only (route handlers, server actions, server
 * components). Reading on demand keeps the values out of client bundles.
 */
export function serverEnv() {
  return {
    anthropicApiKey: clean(process.env.ANTHROPIC_API_KEY),
    anthropicModel: clean(process.env.ANTHROPIC_MODEL),
    supabaseSecretKey: clean(process.env.SUPABASE_SECRET_KEY),
  } as const;
}

/**
 * Escape hatch for a server-only variable a kit adds that is not listed above. Prefer adding a
 * named field to `serverEnv()`; either way, list the variable in `.env.example`.
 */
export function optionalServerEnv(name: string): string | undefined {
  return clean(process.env[name]);
}
