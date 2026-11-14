"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSiteUrl } from "@/lib/env";
import { safeNextPath } from "@/lib/supabase/auth";
import { DEMO_MODE_MESSAGE, type FormState } from "@/lib/supabase/form-state";
import { createClient } from "@/lib/supabase/server";

/**
 * Sign-in, sign-up and sign-out. Each action re-checks its input on the server: never trust
 * what the browser sends.
 */

const emailSchema = z
  .string()
  .trim()
  .min(1, "Enter your email address.")
  .pipe(z.email("Enter a valid email address, like name@example.com."));

const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters for your password.")
  .max(72, "Use 72 characters or fewer.");

/** This site's address as the browser sees it, for links in emails (e.g. http://localhost:3000). */
async function getOrigin(): Promise<string> {
  const h = await headers();
  // Next checks that a Server Action's Origin matches the host, so this header is safe here.
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host) return `${h.get("x-forwarded-proto") ?? "https"}://${host}`;
  return getSiteUrl().origin;
}

function callbackUrl(origin: string, next: string) {
  return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
}

/** supabase-js returns (not throws) this when it can't reach the project at all. */
const UNREACHABLE =
  "Couldn't reach Supabase. Check NEXT_PUBLIC_SUPABASE_URL in .env.local and your internet connection.";
function isUnreachable(error: { name?: string }) {
  return error.name === "AuthRetryableFetchError";
}

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/** Email + password sign-in. */
export async function signInWithPassword(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = { email: text(formData, "email") };
  const parsed = z
    .object({
      email: emailSchema,
      password: z.string().min(1, "Enter your password."),
    })
    .safeParse({ email: values.email, password: text(formData, "password") });
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  const supabase = await createClient();
  if (!supabase) return { status: "error", message: DEMO_MODE_MESSAGE, values };

  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return {
      status: "error",
      message: isUnreachable(error)
        ? UNREACHABLE
        : error.code === "email_not_confirmed"
          ? "Confirm your email first: open the link we sent you, then sign in."
          : "That email and password don't match. Try again, or use a magic link.",
      values,
    };
  }
  redirect(safeNextPath(text(formData, "next")));
}

/** Create an account with email + password. */
export async function signUp(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = {
    email: text(formData, "email"),
    displayName: text(formData, "displayName"),
  };
  const parsed = z
    .object({
      displayName: z
        .string()
        .trim()
        .max(60, "Use 60 characters or fewer.")
        .optional(),
      email: emailSchema,
      password: passwordSchema,
    })
    .safeParse({ ...values, password: text(formData, "password") });
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  const supabase = await createClient();
  if (!supabase) return { status: "error", message: DEMO_MODE_MESSAGE, values };

  const next = safeNextPath(text(formData, "next"));
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: callbackUrl(await getOrigin(), next),
      // The database trigger copies this into profiles.display_name.
      data: { display_name: parsed.data.displayName || null },
    },
  });
  if (error) {
    return {
      status: "error",
      message: isUnreachable(error)
        ? UNREACHABLE
        : error.code === "weak_password"
          ? "Pick a stronger password: longer, with a mix of letters and numbers."
          : error.message,
      values,
    };
  }

  // Email confirmation off in Supabase: the user is signed in already.
  if (data.session) redirect(next);

  return {
    status: "success",
    message: `Check ${parsed.data.email} for a confirmation link, then come back and sign in.`,
  };
}

/** Email a one-time sign-in link (also creates the account if it is new). */
export async function sendMagicLink(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = { email: text(formData, "email") };
  const parsed = emailSchema.safeParse(values.email);
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: { email: parsed.error.issues.map((issue) => issue.message) },
      values,
    };
  }

  const supabase = await createClient();
  if (!supabase) return { status: "error", message: DEMO_MODE_MESSAGE, values };

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: {
      emailRedirectTo: callbackUrl(
        await getOrigin(),
        safeNextPath(text(formData, "next")),
      ),
    },
  });
  if (error) {
    return {
      status: "error",
      message: isUnreachable(error)
        ? UNREACHABLE
        : error.status === 429
          ? "Too many emails sent. Wait a minute and try again."
          : error.message,
      values,
    };
  }
  return {
    status: "success",
    message: `Sign-in link sent to ${parsed.data}. Open it on this device.`,
  };
}

/** Start "Continue with Google". Only works after the provider is enabled in Supabase. */
export async function signInWithGoogle(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient();
  if (!supabase) return { status: "error", message: DEMO_MODE_MESSAGE };

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl(
        await getOrigin(),
        safeNextPath(text(formData, "next")),
      ),
    },
  });
  if (error || !data.url) {
    return {
      status: "error",
      message:
        "Google sign-in isn't set up yet. Enable the Google provider in your Supabase project.",
    };
  }
  redirect(data.url);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/login");
}
