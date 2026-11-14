import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Buttons follow the design axes: `shape` (rounded-control), `density` (h-control),
 * `buttons` (btn / btn-primary / btn-alt read --btn-* tokens) and `accent` (--primary*).
 */
const buttonVariants = cva(
  "btn group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-control text-sm whitespace-nowrap outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "btn-primary",
        outline:
          "btn-alt border-border bg-transparent text-foreground hover:border-primary hover:bg-primary-tint aria-expanded:bg-muted",
        secondary:
          "btn-alt border-secondary bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklab,var(--secondary),var(--foreground)_8%)] aria-expanded:bg-secondary",
        ghost:
          "border-transparent hover:bg-muted hover:text-foreground aria-expanded:bg-muted",
        destructive:
          "border-destructive/50 bg-destructive/15 text-destructive hover:bg-destructive/25 focus-visible:ring-destructive/40",
        link: "h-auto! border-transparent px-0! text-primary-text underline-offset-4 hover:underline",
      },
      size: {
        default: "h-control px-control-x",
        sm: "h-control-sm px-3 text-[0.8125rem]",
        lg: "h-control-lg px-[calc(var(--control-px)*1.3)] text-base",
        icon: "size-control",
        "icon-sm": "size-control-sm",
        "icon-lg": "size-control-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
