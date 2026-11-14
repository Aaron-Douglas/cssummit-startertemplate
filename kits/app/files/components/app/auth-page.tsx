import { TriangleAlertIcon } from "lucide-react";
import { Suspense } from "react";
import { AuthForm } from "@/components/app/auth-form";
import { SetupNotice } from "@/components/app/setup-notice";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { isGoogleAuthEnabled, isSupabaseConfigured } from "@/lib/env";
import { safeNextPath } from "@/lib/supabase/auth";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const ERRORS: Record<string, string> = {
  link: "That sign-in link didn't work. It may have expired or been used already. Ask for a new one below.",
};

/** Shared layout for /login and /signup. */
export function AuthPage({
  mode,
  searchParams,
}: {
  mode: "login" | "signup";
  searchParams: SearchParams;
}) {
  const configured = isSupabaseConfigured();
  const isSignup = mode === "signup";
  return (
    <Container size="narrow" className="flex flex-col gap-8 py-section">
      <PageHeader
        eyebrow="Account"
        title={isSignup ? "Join the project" : "Welcome back"}
        description={
          isSignup
            ? "Make an account to save your work and open your dashboard."
            : "Sign in to open your dashboard."
        }
      />
      {configured ? null : <SetupNotice />}
      <div className="mx-auto w-full max-w-md">
        {/* The query string (?next=, ?error=) is request data: under cacheComponents it is
            read inside <Suspense>; the fallback is the same form with default values. */}
        <Suspense
          fallback={
            <AuthForm
              mode={mode}
              configured={configured}
              googleEnabled={isGoogleAuthEnabled()}
              next="/dashboard"
            />
          }
        >
          <AuthFormWithParams
            mode={mode}
            configured={configured}
            searchParams={searchParams}
          />
        </Suspense>
      </div>
    </Container>
  );
}

async function AuthFormWithParams({
  mode,
  configured,
  searchParams,
}: {
  mode: "login" | "signup";
  configured: boolean;
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const next = safeNextPath(
    Array.isArray(params.next) ? params.next[0] : params.next,
  );
  const errorKey = Array.isArray(params.error) ? params.error[0] : params.error;
  const error = errorKey ? ERRORS[errorKey] : undefined;
  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <Alert variant="destructive">
          <TriangleAlertIcon aria-hidden="true" />
          <AlertTitle>Couldn't sign you in</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <AuthForm
        mode={mode}
        configured={configured}
        googleEnabled={isGoogleAuthEnabled()}
        next={next}
      />
    </div>
  );
}
