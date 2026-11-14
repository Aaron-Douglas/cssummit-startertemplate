import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * Who is signed in, for server code. One place for the checks (a "data access layer").
 *
 * Reads the sign-in cookies, so a Server Component calling these must sit inside <Suspense>.
 */

export type CurrentUser = {
  id: string;
  email: string | null;
  displayName: string | null;
  createdAt: string;
};

/**
 * The signed-in user with their profile row, or `null` (signed out, or demo mode).
 * `cache` makes repeated calls in one request hit Supabase only once.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  if (!supabase) return null;

  // getUser() asks Supabase to confirm the token, so it cannot be faked with a cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // RLS only lets a user read their own row (see supabase/migrations).
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? null,
    displayName: (profile?.display_name as string | null | undefined) ?? null,
    createdAt: user.created_at,
  };
});

/** Like getCurrentUser, but sends signed-out visitors to /login. Use on protected pages. */
export async function requireUser(next = "/dashboard"): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

/** Only allow redirects to paths on this site ("/dashboard"), never "https://evil.example". */
export function safeNextPath(value: unknown, fallback = "/dashboard"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\"))
    return fallback;
  return value;
}
