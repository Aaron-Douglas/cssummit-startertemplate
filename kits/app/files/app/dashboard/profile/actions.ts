"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { DEMO_MODE_MESSAGE, type FormState } from "@/lib/supabase/form-state";
import { createClient } from "@/lib/supabase/server";

const profileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Enter a display name.")
    .max(60, "Use 60 characters or fewer."),
});

/** Save the signed-in user's display name. */
export async function updateProfile(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const raw = formData.get("displayName");
  const values = { displayName: typeof raw === "string" ? raw : "" };
  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  const supabase = await createClient();
  if (!supabase) return { status: "error", message: DEMO_MODE_MESSAGE, values };

  // Check who is asking on the server: never trust a user id sent by the browser.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      status: "error",
      message: "You were signed out. Sign in again, then retry.",
      values,
    };
  }

  // RLS also blocks changing anyone else's row, even if this code had a bug.
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: parsed.data.displayName })
    .eq("id", user.id);
  if (error) {
    return {
      status: "error",
      message:
        error.code === "42P01" || error.code === "PGRST205"
          ? "The profiles table is missing. Run the migration in supabase/migrations (see kits/app/README.md)."
          : "Couldn't save your profile. Try again.",
      values,
    };
  }

  // Show the new name on every dashboard page.
  revalidatePath("/dashboard", "layout");
  return {
    status: "success",
    message: "Profile saved.",
    values: { displayName: parsed.data.displayName },
  };
}
