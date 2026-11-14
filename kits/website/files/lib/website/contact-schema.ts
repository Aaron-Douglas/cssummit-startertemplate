import { z } from "zod";

/**
 * The rules for the contact form. The server checks every message against this, so the
 * rules hold even if someone skips the form. Change the limits or messages here.
 */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please tell us your name.")
    .max(100, "That name is a bit long. 100 characters at most."),
  email: z
    .string()
    .trim()
    .min(1, "We need an email to reply to you.")
    .pipe(z.email("That doesn't look like an email address.")),
  message: z
    .string()
    .trim()
    .min(10, "Say a little more: at least 10 characters.")
    .max(2000, "Please keep it under 2,000 characters."),
});

export type ContactMessage = z.infer<typeof contactSchema>;

export type ContactField = keyof ContactMessage;

/** What the server action sends back to the form after each submit. */
export type ContactState = {
  status: "idle" | "success" | "error";
  /** A sentence for the person: shown above the button and read out by screen readers. */
  message: string;
  /** One message per field that failed. */
  errors: Partial<Record<ContactField, string>>;
  /** What was typed, so a failed submit doesn't wipe the form. */
  values: Partial<Record<ContactField, string>>;
};

export const initialContactState: ContactState = {
  status: "idle",
  message: "",
  errors: {},
  values: {},
};
