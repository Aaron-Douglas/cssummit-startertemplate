"use client";

import { CheckCircle2Icon, SendIcon } from "lucide-react";
import type * as React from "react";
import { useActionState, useEffect, useRef } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContact } from "@/lib/website/contact-action";
import {
  type ContactField,
  initialContactState,
} from "@/lib/website/contact-schema";

/**
 * The contact form. It posts to the `submitContact` server action (lib/website/contact-action.ts),
 * which validates with zod and returns errors per field. Works without JavaScript too.
 */
export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    submitContact,
    initialContactState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  // After a failed submit, move focus to the first field with a problem.
  useEffect(() => {
    if (state.status !== "error") return;
    const first = (["name", "email", "message"] as const).find(
      (field) => state.errors[field],
    );
    if (!first) return;
    const input = formRef.current?.elements.namedItem(first);
    if (input instanceof HTMLElement) input.focus();
  }, [state]);

  const fieldProps = (field: ContactField) => ({
    id: `contact-${field}`,
    name: field,
    defaultValue: state.values[field] ?? "",
    "aria-invalid": state.errors[field] ? true : undefined,
    "aria-describedby": state.errors[field]
      ? `contact-${field}-error`
      : undefined,
  });

  return (
    <form
      ref={formRef}
      action={formAction}
      // The server checks everything, so skip the browser's own popups and show our messages.
      noValidate
      className="flex flex-col gap-stack"
    >
      <div className="grid gap-stack sm:grid-cols-2">
        <Field label="Name" field="name" error={state.errors.name}>
          <Input {...fieldProps("name")} autoComplete="name" required />
        </Field>
        <Field label="Email" field="email" error={state.errors.email}>
          <Input
            {...fieldProps("email")}
            type="email"
            autoComplete="email"
            required
          />
        </Field>
      </div>
      <Field label="Message" field="message" error={state.errors.message}>
        <Textarea {...fieldProps("message")} rows={6} required />
      </Field>

      {/* Spam trap. Hidden from people and screen readers; see contact-action.ts. */}
      <div aria-hidden className="hidden">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div aria-live="polite" aria-atomic="true">
        {state.status === "success" ? (
          <Alert variant="success">
            <CheckCircle2Icon />
            <AlertTitle>Message received</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        ) : null}
        {state.status === "error" ? (
          <p className="text-sm font-medium text-destructive">
            {state.message}
          </p>
        ) : null}
      </div>

      <Button type="submit" disabled={pending} className="self-start">
        <SendIcon />
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}

function Field({
  label,
  field,
  error,
  children,
}: {
  label: string;
  field: ContactField;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={`contact-${field}`}>{label}</Label>
      {children}
      {error ? (
        <p id={`contact-${field}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
