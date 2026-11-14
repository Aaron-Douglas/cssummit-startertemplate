"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/dashboard/profile/actions";
import { Field, FormMessage, SubmitButton } from "@/components/app/form-parts";
import { initialFormState } from "@/lib/supabase/form-state";

/** Edit the display name. The Server Action validates with zod and saves to Supabase. */
export function ProfileForm({
  displayName,
  email,
  disabled = false,
}: {
  displayName: string;
  email: string;
  disabled?: boolean;
}) {
  const [state, action] = useActionState(updateProfile, initialFormState);
  return (
    <form action={action} noValidate className="flex flex-col gap-4">
      <fieldset disabled={disabled} className="flex min-w-0 flex-col gap-4">
        <legend className="sr-only">Profile details</legend>
        <FormMessage state={state} />
        <Field
          id="profile-email"
          label="Email"
          type="email"
          value={email}
          readOnly
          hint="Your sign-in email. It can't be changed here."
        />
        <Field
          id="profile-display-name"
          name="displayName"
          label="Display name"
          autoComplete="nickname"
          required
          maxLength={60}
          defaultValue={state.values?.displayName ?? displayName}
          hint="Shown on your dashboard. Up to 60 characters."
          errors={state.fieldErrors?.displayName}
        />
        <div>
          <SubmitButton pendingLabel="Saving...">Save changes</SubmitButton>
        </div>
      </fieldset>
    </form>
  );
}
