import type * as React from "react";
import { DashboardNav } from "@/components/app/dashboard-nav";
import { SignOutButton } from "@/components/app/sign-out-button";
import { Container } from "@/components/container";

/**
 * The dashboard shell: a menu (left on wide screens, on top on phones) and the page.
 * It reads nothing about the user, so it renders instantly; each page checks the user
 * itself inside <Suspense>. proxy.ts also sends signed-out visitors to /login.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container className="grid gap-8 py-section lg:grid-cols-[12rem_minmax(0,1fr)]">
      <aside className="flex flex-col gap-4 border-b pb-4 lg:border-r lg:border-b-0 lg:pr-6 lg:pb-0">
        <p className="eyebrow">Dashboard</p>
        <DashboardNav />
        <SignOutButton />
      </aside>
      <div className="flex min-w-0 flex-col gap-8">{children}</div>
    </Container>
  );
}
