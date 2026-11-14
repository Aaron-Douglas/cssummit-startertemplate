"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  sendMagicLink,
  signInWithGoogle,
  signInWithPassword,
  signUp,
} from "@/app/auth/actions";
import { Field, FormMessage, SubmitButton } from "@/components/app/form-parts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { initialFormState } from "@/lib/supabase/form-state";

type Mode = "login" | "signup";

/**
 * Sign-in and sign-up card: email + password, magic link, and Google (only when
 * NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true). In demo mode every control is disabled.
 */
export function AuthForm({
  mode,
  configured,
  googleEnabled,
  next,
}: {
  mode: Mode;
  configured: boolean;
  googleEnabled: boolean;
  next: string;
}) {
  const isSignup = mode === "signup";
  const [passwordState, passwordAction] = useActionState(
    isSignup ? signUp : signInWithPassword,
    initialFormState,
  );
  const [magicState, magicAction] = useActionState(
    sendMagicLink,
    initialFormState,
  );
  const [googleState, googleAction] = useActionState(
    signInWithGoogle,
    initialFormState,
  );

  const otherHref = `${isSignup ? "/login" : "/signup"}${
    next === "/dashboard" ? "" : `?next=${encodeURIComponent(next)}`
  }`;
  const prefix = isSignup ? "signup" : "login";
  const passwordErrors = passwordState.fieldErrors ?? {};

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>{isSignup ? "Create your account" : "Sign in"}</h2>
        </CardTitle>
        <CardDescription>
          {isSignup
            ? "Use your email and a password, or get a sign-in link by email."
            : "Welcome back. Use your password or a one-time email link."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* A disabled fieldset disables every input and button inside it (demo mode). */}
        <fieldset
          disabled={!configured}
          aria-describedby={configured ? undefined : "auth-demo-note"}
          className="flex min-w-0 flex-col gap-stack"
        >
          <legend className="sr-only">
            {isSignup ? "Sign-up options" : "Sign-in options"}
          </legend>
          {configured ? null : (
            <p id="auth-demo-note" className="text-sm text-muted-foreground">
              These forms are switched off in demo mode.
            </p>
          )}

          {passwordState.status === "success" ? (
            <FormMessage state={passwordState} />
          ) : (
            <form
              action={passwordAction}
              noValidate
              className="flex flex-col gap-4"
            >
              <FormMessage state={passwordState} />
              <input type="hidden" name="next" value={next} />
              {isSignup ? (
                <Field
                  id={`${prefix}-name`}
                  name="displayName"
                  label="Display name (optional)"
                  autoComplete="nickname"
                  maxLength={60}
                  defaultValue={passwordState.values?.displayName}
                  errors={passwordErrors.displayName}
                />
              ) : null}
              <Field
                id={`${prefix}-email`}
                name="email"
                type="email"
                label="Email"
                autoComplete="email"
                inputMode="email"
                required
                defaultValue={passwordState.values?.email}
                errors={passwordErrors.email}
              />
              <Field
                id={`${prefix}-password`}
                name="password"
                type="password"
                label="Password"
                autoComplete={isSignup ? "new-password" : "current-password"}
                required
                minLength={isSignup ? 8 : undefined}
                hint={isSignup ? "At least 8 characters." : undefined}
                errors={passwordErrors.password}
              />
              <SubmitButton
                className="w-full"
                pendingLabel={
                  isSignup ? "Creating account..." : "Signing in..."
                }
              >
                {isSignup ? "Create account" : "Sign in"}
              </SubmitButton>
            </form>
          )}

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Separator className="flex-1" />
            <span>or</span>
            <Separator className="flex-1" />
          </div>

          <form action={magicAction} noValidate className="flex flex-col gap-4">
            <FormMessage state={magicState} />
            <input type="hidden" name="next" value={next} />
            <Field
              id={`${prefix}-magic-email`}
              name="email"
              type="email"
              label="Email me a sign-in link"
              autoComplete="email"
              inputMode="email"
              required
              defaultValue={magicState.values?.email}
              errors={magicState.fieldErrors?.email}
            />
            <SubmitButton
              variant="outline"
              className="w-full"
              pendingLabel="Sending link..."
            >
              Send magic link
            </SubmitButton>
          </form>

          {googleEnabled ? (
            <form action={googleAction} className="flex flex-col gap-4">
              <FormMessage state={googleState} />
              <input type="hidden" name="next" value={next} />
              <SubmitButton
                variant="secondary"
                className="w-full"
                pendingLabel="Opening Google..."
              >
                Continue with Google
              </SubmitButton>
            </form>
          ) : null}
        </fieldset>
      </CardContent>

      <CardFooter className="flex-wrap text-sm text-muted-foreground">
        {isSignup ? "Already have an account?" : "New here?"}
        <Link
          href={otherHref}
          className="rounded-control font-medium text-primary-text underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none"
        >
          {isSignup ? "Sign in" : "Create an account"}
        </Link>
      </CardFooter>
    </Card>
  );
}
