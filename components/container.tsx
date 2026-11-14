import type * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Page-width wrapper. The width follows the `layout` design axis (max-w-page) with a 1rem
 * gutter on phones. Use `size="narrow"` for reading pages and forms.
 */
export function Container({
  className,
  size = "page",
  ...props
}: React.ComponentProps<"div"> & { size?: "page" | "narrow" | "full" }) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        size === "page" && "max-w-page",
        size === "narrow" && "max-w-3xl",
        className,
      )}
      {...props}
    />
  );
}

/** A vertical page section with density-aware padding (py-section). */
export function Section({
  className,
  ...props
}: React.ComponentProps<"section">) {
  return <section className={cn("py-section", className)} {...props} />;
}
