import {
  ArrowRightIcon,
  CalendarDaysIcon,
  RocketIcon,
  ShieldCheckIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type * as React from "react";
import { Suspense } from "react";
import { demoUser, initials } from "@/components/app/demo-user";
import { SetupNotice } from "@/components/app/setup-notice";
import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/env";
import { type CurrentUser, requireUser } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your dashboard.",
};

/**
 * The page signed-in users land on. Replace the sample tiles with your project's feature.
 * Anything that reads the user goes inside <Suspense> (cacheComponents).
 */
export default function DashboardPage() {
  const configured = isSupabaseConfigured();
  return (
    <>
      <PageHeader
        eyebrow={
          configured ? (
            "Overview"
          ) : (
            <>
              Overview <Badge variant="warning">Demo</Badge>
            </>
          )
        }
        title="Dashboard"
        description="Only you can see this page. Build your project's main feature here."
      />
      {configured ? (
        <Suspense fallback={<DashboardSkeleton />}>
          <SignedInDashboard />
        </Suspense>
      ) : (
        <>
          <SetupNotice>
            <p>
              This is a sample view with pretend data, so you can see the layout
              before sign-in works.
            </p>
          </SetupNotice>
          <DashboardView user={demoUser} demo />
        </>
      )}
    </>
  );
}

async function SignedInDashboard() {
  const user = await requireUser("/dashboard");
  return <DashboardView user={user} />;
}

function DashboardView({
  user,
  demo = false,
}: {
  user: CurrentUser;
  demo?: boolean;
}) {
  const name = user.displayName || user.email || "there";
  const joined = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <>
      <Card>
        <CardHeader className="grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4">
          <Avatar size="lg" className="row-span-2">
            <AvatarFallback>
              {initials(user.displayName, user.email)}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="truncate">Welcome, {name}</CardTitle>
          <CardDescription className="break-words">
            Signed in as {user.email ?? "(no email)"}
            {demo ? " (sample data)" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild size="sm">
            <Link href="/dashboard/profile">
              Edit your profile <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <ul className="grid gap-stack sm:grid-cols-2 xl:grid-cols-3">
        <li>
          <Tile
            icon={<CalendarDaysIcon aria-hidden="true" />}
            title="Member since"
            value={joined}
            note="When this account was created."
          />
        </li>
        <li>
          <Tile
            icon={<ShieldCheckIcon aria-hidden="true" />}
            title="Your data"
            value="Private"
            note="Row Level Security lets each user read and change only their own profile."
          />
        </li>
        <li className="sm:col-span-2 xl:col-span-1">
          <Tile
            icon={<RocketIcon aria-hidden="true" />}
            title="Next step"
            value="Build your feature"
            note="Edit app/dashboard/page.tsx, or ask Claude Code to add a table for your idea."
          />
        </li>
      </ul>
    </>
  );
}

function Tile({
  icon,
  title,
  value,
  note,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  note: string;
}) {
  return (
    <Card size="sm" className="h-full">
      <CardHeader>
        <CardDescription className="flex items-center gap-2 [&_svg]:size-4 [&_svg]:text-primary-text">
          {icon}
          {title}
        </CardDescription>
        <CardTitle className="text-xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {note}
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-stack">
      <p className="sr-only">Loading your dashboard...</p>
      <div className="surface h-32 animate-pulse rounded-card" />
      <div className="grid gap-stack sm:grid-cols-2 xl:grid-cols-3">
        <div className="surface h-36 animate-pulse rounded-card" />
        <div className="surface h-36 animate-pulse rounded-card" />
        <div className="surface h-36 animate-pulse rounded-card" />
      </div>
    </div>
  );
}
