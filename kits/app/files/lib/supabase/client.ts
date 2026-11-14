"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, publicEnv } from "@/lib/env";

/**
 * Supabase client for Client Components (code that runs in the browser).
 *
 * Returns `null` in demo mode (no Supabase keys yet), so always check:
 *
 *   const supabase = createClient();
 *   if (!supabase) return; // demo mode
 *
 * It uses the publishable key, which is safe in the browser: Row Level Security policies in
 * supabase/migrations decide what each signed-in user may read and write.
 */
export function createClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  return createBrowserClient(
    publicEnv.supabaseUrl as string,
    publicEnv.supabasePublishableKey as string,
  );
}
