import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { isSupabaseConfigured, publicEnv } from "@/lib/env";

/**
 * Supabase client for server code: Server Components, Server Actions and Route Handlers.
 *
 * Returns `null` in demo mode (no Supabase keys yet). It reads the sign-in cookies, so a
 * Server Component that calls it must sit inside a <Suspense> boundary (cacheComponents).
 *
 * Every request gets a fresh client: never store one in a module-level variable.
 */
export async function createClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured()) return null;
  const cookieStore = await cookies();
  return createServerClient(
    publicEnv.supabaseUrl as string,
    publicEnv.supabasePublishableKey as string,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Components cannot write cookies. That is fine: proxy.ts refreshes the
            // session before the page renders. Server Actions and Route Handlers can write.
          }
        },
      },
    },
  );
}
