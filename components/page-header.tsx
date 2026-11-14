import type * as React from "react";
import { cn } from "@/lib/utils";

/**
 * The heading block at the top of a page: mono eyebrow with the accent bar, a heading in the
 * current type pairing, an optional description and optional actions (buttons) on the right.
 *
 *   <PageHeader eyebrow="Map" title="Places to eat near campus" description="..." />
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
  as: Heading = "h1",
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-6 border-b pb-8 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-4">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <Heading className="text-4xl sm:text-5xl">{title}</Heading>
        {description ? (
          <p className="max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-3">{actions}</div>
      ) : null}
    </header>
  );
}
