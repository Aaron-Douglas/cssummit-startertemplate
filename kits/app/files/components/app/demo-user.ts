import type { CurrentUser } from "@/lib/supabase/auth";

/** The pretend user shown in demo mode (no Supabase project connected). */
export const demoUser: CurrentUser = {
  id: "demo",
  email: "you@example.com",
  displayName: "Demo Student",
  createdAt: "2026-01-01T12:00:00.000Z",
};

/** "Ada Lovelace" -> "AL", "ada@x.com" -> "A". */
export function initials(name: string | null, email: string | null): string {
  const source = name?.trim() || email || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  const letters =
    parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`
      : source[0];
  return letters.toUpperCase();
}
