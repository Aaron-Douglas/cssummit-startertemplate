import Link from "next/link";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { DesktopNav } from "./desktop-nav";
import { MobileMenu } from "./mobile-menu";

/**
 * nav="floating": a detached, blurred capsule that hovers over the page. The page shell adds
 * top padding with `nav-floating:pt-24` so content starts below it.
 */
export function NavFloating() {
  // Few links fit from md up; with kits installed the header switches at lg instead.
  const wide = site.nav.length > 3;
  return (
    <header className="pointer-events-none fixed inset-x-0 top-3 z-40 px-3 sm:top-5">
      <div className="pointer-events-auto mx-auto flex max-w-5xl items-center justify-between gap-4 rounded-card border border-border/80 bg-background/75 py-2.5 pr-2.5 pl-5 shadow-2xl backdrop-blur-xl">
        <Brand size="sm" />
        <nav
          aria-label="Main"
          className={cn("hidden", wide ? "lg:block" : "md:block")}
        >
          <DesktopNav links={site.nav} />
        </nav>
        <div className="flex items-center gap-2">
          <Button
            asChild
            size="sm"
            className={cn("hidden", wide ? "lg:inline-flex" : "md:inline-flex")}
          >
            <Link href={site.cta.href}>{site.cta.label}</Link>
          </Button>
          <MobileMenu className={wide ? "lg:hidden" : "md:hidden"} />
        </div>
      </div>
    </header>
  );
}
