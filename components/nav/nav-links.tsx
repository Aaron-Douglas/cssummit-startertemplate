"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavLink } from "@/lib/site";
import { cn } from "@/lib/utils";

export function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  const path = href.split("#")[0];
  return path !== "" && (pathname === path || pathname.startsWith(`${path}/`));
}

/** The site's nav links with aria-current on the active one. */
export function NavLinks({
  links,
  orientation = "horizontal",
  className,
  onNavigate,
}: {
  links: readonly NavLink[];
  orientation?: "horizontal" | "vertical";
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <ul
      className={cn(
        "flex",
        orientation === "horizontal"
          ? "items-center gap-1"
          : "flex-col items-stretch gap-1",
        className,
      )}
    >
      {links.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center rounded-control px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                "aria-[current=page]:text-foreground",
                orientation === "horizontal"
                  ? "aria-[current=page]:shadow-[inset_0_-2px_0_var(--primary)]"
                  : "aria-[current=page]:bg-primary-tint aria-[current=page]:text-primary-text",
              )}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
