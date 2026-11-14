import { PlugZapIcon } from "lucide-react";
import type * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

/**
 * Shown while the app runs in demo mode (no Supabase keys in .env.local yet).
 * Disappears by itself once NEXT_PUBLIC_SUPABASE_URL and
 * NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are set and the dev server restarts.
 */
export function SetupNotice({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Alert variant="info" className={cn(className)}>
      <PlugZapIcon aria-hidden="true" />
      <AlertTitle>Demo mode: sign-in is switched off</AlertTitle>
      <AlertDescription>
        <p>
          Connect your own Supabase project: run{" "}
          <code className="font-mono text-foreground">/setup</code> in Claude
          Code, or follow the steps in{" "}
          <code className="font-mono text-foreground">kits/app/README.md</code>.
        </p>
        {children}
      </AlertDescription>
    </Alert>
  );
}
