/**
 * What a form's Server Action sends back to the form (used with React's useActionState).
 * Lives outside the "use server" files, which may only export async functions.
 */
export type FormState = {
  status: "idle" | "error" | "success";
  /** A message for the whole form, shown above the fields. */
  message?: string;
  /** Messages for single fields, keyed by the input's `name`. */
  fieldErrors?: Partial<Record<string, string[]>>;
  /** Values to put back in the inputs after a failed submit (never passwords). */
  values?: Record<string, string>;
};

export const initialFormState: FormState = { status: "idle" };

export const DEMO_MODE_MESSAGE =
  "Demo mode: connect your own Supabase project first (run /setup in Claude Code or see kits/app/README.md).";
