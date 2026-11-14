import { type NextRequest, NextResponse } from "next/server";
import { safeNextPath } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

/**
 * Where Supabase sends people back after a magic link, a confirmation email or Google.
 * The URL carries a one-time `code` that is swapped for a sign-in session (cookies).
 *
 * Add http://localhost:3000/auth/callback and https://<your-site>/auth/callback to
 * Supabase > Authentication > URL Configuration > Redirect URLs.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  const supabase = await createClient();
  if (supabase && code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, request.url));
  }

  const failed = new URL("/login", request.url);
  failed.searchParams.set("error", "link");
  return NextResponse.redirect(failed);
}
