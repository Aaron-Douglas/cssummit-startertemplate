import { DesignVariant } from "@/components/design-variant";
import { NavBar } from "@/components/nav/bar";
import { NavFloating } from "@/components/nav/floating";
import { NavSidebar } from "@/components/nav/sidebar";
import type { Design } from "@/lib/design";

/** The site header for the current `nav` design axis. */
export function SiteHeader({ nav }: { nav: Design["nav"] }) {
  return (
    <DesignVariant
      axis="nav"
      active={nav}
      variants={{
        bar: <NavBar />,
        floating: <NavFloating />,
        sidebar: <NavSidebar />,
      }}
    />
  );
}
