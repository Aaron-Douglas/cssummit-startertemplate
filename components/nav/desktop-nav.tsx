"use client";

import { ChevronDownIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { NavLink } from "@/lib/site";
import { cn } from "@/lib/utils";
import { isActive, NavLinks } from "./nav-links";

/** How many links a horizontal header shows before the rest go into a "More" menu. */
export const MAX_INLINE_LINKS = 4;

/**
 * The header's horizontal links. With many kits installed there can be ten or more links, so
 * the first few show inline and the rest sit in a "More" menu instead of wrapping.
 */
export function DesktopNav({
  links,
  max = MAX_INLINE_LINKS,
}: {
  links: readonly NavLink[];
  max?: number;
}) {
  const pathname = usePathname();
  // Keep "More" for two or more extra links; a menu holding a single link is pointless.
  const split = links.length > max + 1;
  const inline = split ? links.slice(0, max) : links;
  const overflow = split ? links.slice(max) : [];
  const overflowActive = overflow.some((link) => isActive(pathname, link.href));

  return (
    <div className="flex items-center gap-1">
      <NavLinks links={inline} />
      {overflow.length ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              data-active={overflowActive ? "" : undefined}
              className={cn(
                "flex items-center gap-1 rounded-control px-3 py-2 text-sm font-medium text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                "data-active:text-foreground data-active:shadow-[inset_0_-2px_0_var(--primary)]",
              )}
            >
              More
              <ChevronDownIcon aria-hidden className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44">
            {overflow.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <DropdownMenuItem key={link.href} asChild>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className="aria-[current=page]:text-primary-text"
                  >
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
}
