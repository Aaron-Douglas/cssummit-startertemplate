import Link from "next/link";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";
import { MobileMenu } from "./mobile-menu";
import { NavLinks } from "./nav-links";

/**
 * nav="sidebar": a fixed column on the left from lg up (the page shell adds the matching
 * left padding with `nav-sidebar:lg:pl-64`), a compact top bar on smaller screens.
 */
export function NavSidebar() {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col gap-8 border-r bg-card px-5 py-6 lg:flex">
        <Brand />
        <nav
          aria-label="Main"
          className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1"
        >
          <p className="mb-3 px-3 font-mono text-[0.6875rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            Pages
          </p>
          <NavLinks links={site.nav} orientation="vertical" />
        </nav>
        <Button asChild className="w-full">
          <Link href={site.cta.href}>{site.cta.label}</Link>
        </Button>
      </aside>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-card px-4 lg:hidden">
        <Brand size="sm" />
        <MobileMenu />
      </header>
    </>
  );
}
