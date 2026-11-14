import { LogOutIcon } from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/env";

/** A form, not a link, so signing out works without JavaScript and can't be prefetched. */
export function SignOutButton({ className }: { className?: string }) {
  const configured = isSupabaseConfigured();
  return (
    <form action={signOut} className={className}>
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        disabled={!configured}
        title={configured ? undefined : "Sign-out is off in demo mode"}
      >
        <LogOutIcon aria-hidden="true" />
        Sign out
      </Button>
    </form>
  );
}
