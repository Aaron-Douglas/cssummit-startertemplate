import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Next 16 renamed middleware.ts to proxy.ts. Do not add a middleware.ts next to this file.
// Added by the `app` kit: keeps the Supabase session fresh and sends signed-out visitors
// from /dashboard to /login. In demo mode (no Supabase keys) it does nothing.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Every page except build assets and files in public/ (anything with a file extension).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json|webmanifest)$).*)",
  ],
};
