import type { Metadata } from "next";
import { Suspense } from "react";
import { demoUser } from "@/components/app/demo-user";
import { ProfileForm } from "@/components/app/profile-form";
import { SetupNotice } from "@/components/app/setup-notice";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/env";
import { requireUser } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Profile",
  description: "Edit your profile.",
};

export default function ProfilePage() {
  const configured = isSupabaseConfigured();
  return (
    <>
      <PageHeader
        eyebrow={
          configured ? (
            "Profile"
          ) : (
            <>
              Profile <Badge variant="warning">Demo</Badge>
            </>
          )
        }
        title="Your profile"
        description="How you appear in this app."
      />
      {configured ? null : (
        <SetupNotice>
          <p>The form below is a preview and can't be saved yet.</p>
        </SetupNotice>
      )}
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>
            Saved to the <code className="font-mono">profiles</code> table in
            your Supabase project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {configured ? (
            <Suspense fallback={<ProfileSkeleton />}>
              <SignedInProfileForm />
            </Suspense>
          ) : (
            <ProfileForm
              displayName={demoUser.displayName ?? ""}
              email={demoUser.email ?? ""}
              disabled
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}

async function SignedInProfileForm() {
  const user = await requireUser("/dashboard/profile");
  return (
    <ProfileForm
      displayName={user.displayName ?? ""}
      email={user.email ?? ""}
    />
  );
}

function ProfileSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-4">
      <p className="sr-only">Loading your profile...</p>
      <div className="h-control animate-pulse rounded-control bg-muted" />
      <div className="h-control animate-pulse rounded-control bg-muted" />
      <div className="h-control w-32 animate-pulse rounded-control bg-muted" />
    </div>
  );
}
