"use client";

import { CheckCircle2Icon, TriangleAlertIcon } from "lucide-react";
import type * as React from "react";
import { useFormStatus } from "react-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormState } from "@/lib/supabase/form-state";

/**
 * A labelled input with its hint and error text tied to it (aria-describedby), so screen
 * readers announce them with the field.
 */
export function Field({
  id,
  label,
  hint,
  errors,
  ...inputProps
}: React.ComponentProps<typeof Input> & {
  id: string;
  label: string;
  hint?: string;
  errors?: string[];
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = errors?.length ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-invalid={errorId ? true : undefined}
        aria-describedby={describedBy}
        {...inputProps}
      />
      {hint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {errorId ? (
        <p id={errorId} className="text-sm text-destructive">
          {errors?.join(" ")}
        </p>
      ) : null}
    </div>
  );
}

/** The form-wide result of the last submit: an error or a success message. */
export function FormMessage({ state }: { state: FormState }) {
  if (!state.message) return null;
  const isError = state.status === "error";
  return (
    <Alert variant={isError ? "destructive" : "success"}>
      {isError ? (
        <TriangleAlertIcon aria-hidden="true" />
      ) : (
        <CheckCircle2Icon aria-hidden="true" />
      )}
      <AlertDescription className={isError ? undefined : "text-foreground"}>
        {state.message}
      </AlertDescription>
    </Alert>
  );
}

/** A submit button that shows a busy label while its form's Server Action runs. */
export function SubmitButton({
  children,
  pendingLabel,
  ...props
}: React.ComponentProps<typeof Button> & { pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      {...props}
      type="submit"
      disabled={pending || props.disabled}
      aria-busy={pending || undefined}
    >
      {pending ? pendingLabel : children}
    </Button>
  );
}
