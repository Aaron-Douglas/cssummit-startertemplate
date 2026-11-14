---
paths:
  - "supabase/**"
  - "lib/supabase/**"
---

# Database rules (Supabase)

- Only touch the learner's own Supabase project. Confirm which project before running anything against it (see "Accounts are yours" in `AGENTS.md`).
- Schema changes are migration files in `supabase/migrations/`, committed to git. Name them `<timestamp>_<what>.sql`.
- Never edit a migration that has already been applied or shipped. Write a new migration that changes it.
- Row Level Security lives in migrations. Every new table gets `enable row level security` and its policies in the same migration. No table without RLS.
- Before writing a query or a type, check the real tables and columns (Supabase MCP `list_tables`, or the Table Editor). Do not guess column names.
- Apply migrations with the Supabase MCP `apply_migration` or by pasting the file into the SQL Editor. Then run the security advisors (`get_advisors`, type `security`) and fix what they report.
- The publishable key is the only key the browser sees. A service-role or secret key is server-only: never in a `NEXT_PUBLIC_` variable, never in a client component, never in git.
- Read env vars through `lib/env.ts`. Code must keep working in demo mode when Supabase is not configured.
