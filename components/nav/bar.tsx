import Link from "next/link";
import { Brand } from "@/components/brand";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { DesktopNav } from "./desktop-nav";
import { MobileMenu } from "./mobile-menu";

/** nav="bar": a full-width sticky bar with a hairline under it. */
export function NavBar() {
  // Few links fit from md up; with kits installed the header switches at lg instead.
  const wide = site.nav.length > 3;
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
      <Container className="flex h-18 items-center justify-between gap-4">
        <Brand />
        <nav
          aria-label="Main"
          className={cn("hidden", wide ? "lg:block" : "md:block")}
        >
          <DesktopNav links={site.nav} />
        </nav>
        <div className="flex items-center gap-3">
          <Button
            asChild
            size="sm"
            className={cn("hidden", wide ? "lg:inline-flex" : "md:inline-flex")}
          >
            <Link href={site.cta.href}>{site.cta.label}</Link>
          </Button>
          <MobileMenu className={wide ? "lg:hidden" : "md:hidden"} />
        </div>
      </Container>
    </header>
  );
}
