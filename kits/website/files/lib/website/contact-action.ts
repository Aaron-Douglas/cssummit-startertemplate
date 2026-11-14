"use server";

import {
  type ContactField,
  type ContactMessage,
  type ContactState,
  contactSchema,
} from "@/lib/website/contact-schema";

/**
 * Runs on the server when someone submits the contact form (see components/website/contact-form.tsx).
 * It validates the message with zod, then "delivers" it. Out of the box, delivering means
 * writing it to the server log (the terminal running `pnpm dev`, or your Vercel logs).
 */
export async function submitContact(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  // Spam trap: real people never see or fill the hidden "website" field. Bots often do.
  // Pretend it worked so the bot moves on, but don't deliver anything.
  if (String(formData.get("website") ?? "") !== "") {
    return thanks();
  }

  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    const errors: ContactState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as ContactField;
      errors[field] ??= issue.message;
    }
    return {
      status: "error",
      message: "Please fix the highlighted fields and try again.",
      errors,
      values,
    };
  }

  try {
    await deliver(parsed.data);
  } catch (error) {
    console.error("[contact] Could not deliver a message:", error);
    return {
      status: "error",
      message: "Something went wrong on our side. Please try again in a bit.",
      errors: {},
      values,
    };
  }

  return thanks();
}

function thanks(): ContactState {
  return {
    status: "success",
    message: "Thanks! We got your message and will reply by email.",
    errors: {},
    values: {},
  };
}

/**
 * ─── PLUG IN YOUR OWN DELIVERY HERE ──────────────────────────────────────────────────────────
 * Right now this only logs the message. To actually receive messages, replace the body with
 * ONE of these (and keep any keys in .env.local, read through lib/env.ts):
 *
 * - Email: send it with a service such as Resend or Postmark. Add the API key as a server-only
 *   variable (no NEXT_PUBLIC_ prefix), read it with optionalServerEnv("RESEND_API_KEY"), and
 *   list it in .env.example.
 * - Database: if you added the `app` kit (Supabase), insert a row into a `messages` table.
 * - A form service or a Slack/Discord webhook: POST the message with fetch().
 *
 * If delivery fails, throw an error: the form shows a friendly "try again" message.
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 */
async function deliver(message: ContactMessage): Promise<void> {
  console.log("[contact] New message (not sent anywhere yet):", {
    name: message.name,
    email: message.email,
    message: message.message,
  });
}
