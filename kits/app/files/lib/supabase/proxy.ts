import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, publicEnv } from "@/lib/env";

/**
 * Session refresh + a simple "signed in or not" gate, called from proxy.ts on every page
 * request.
 *
 * Why here: Server Components cannot write cookies, so a sign-in token refreshed while a page
 * renders would be thrown away. The proxy runs before rendering, where cookies can be written.
 *
 * This is not the only check: pages and Server Actions call getCurrentUser() themselves, and
 * Row Level Security in the database has the final say.
 */

/** Pages that need a signed-in user. Add your own, e.g. "/settings". */
export const PROTECTED_PREFIXES = ["/dashboard"];

export function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Supabase keeps the session in `sb-<project>-auth-token` cookies (split as .0, .1 ...). */
function hasSessionCookie(request: NextRequest) {
  return request.cookies
    .getAll()
    .some(({ name }) => name.startsWith("sb-") && name.includes("-auth-token"));
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set(
    "next",
    request.nextUrl.pathname + request.nextUrl.search,
  );
  return NextResponse.redirect(url);
}

export async function updateSession(request: NextRequest) {
  // Demo mode: no Supabase project connected, so there is no session to refresh or check.
  // /dashboard shows sample data instead of redirecting.
  if (!isSupabaseConfigured()) return NextResponse.next();

  const protectedPath = isProtectedPath(request.nextUrl.pathname);

  // No session cookie: nothing to refresh, no reason to call Supabase.
  if (!hasSessionCookie(request)) {
    return protectedPath ? redirectToLogin(request) : NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    publicEnv.supabaseUrl as string,
    publicEnv.supabasePublishableKey as string,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          // Write to the request so the page rendered next sees the fresh token, then rebuild
          // the response so the browser gets the same cookies.
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  try {
    // Checks the token and refreshes it if it expired. Nothing may run between creating the
    // client and this call, or the refresh can race.
    const { data } = await supabase.auth.getClaims();
    if (!data?.claims && protectedPath) return redirectToLogin(request);
  } catch (error) {
    // A Supabase outage must not take every page down; the page checks still run.
    console.error("[proxy] Supabase session refresh failed", error);
  }

  // Return this exact response: it carries the refreshed cookies.
  return response;
}
