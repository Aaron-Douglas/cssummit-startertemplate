"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { NavLinks } from "./nav-links";

/** The phone menu: a button that opens a sheet with every nav link and the CTA. */
export function MobileMenu({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn("shrink-0", className)}
          aria-label="Open menu"
        >
          <MenuIcon />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(20rem,85vw)] gap-6 p-6">
        <SheetHeader className="p-0">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Site navigation
          </SheetDescription>
          <Brand size="sm" />
        </SheetHeader>
        <nav aria-label="Mobile" className="-mx-1 min-h-0 overflow-y-auto px-1">
          <NavLinks
            links={site.nav}
            orientation="vertical"
            onNavigate={() => setOpen(false)}
          />
        </nav>
        <Button asChild className="mt-auto">
          <Link href={site.cta.href} onClick={() => setOpen(false)}>
            {site.cta.label}
          </Link>
        </Button>
      </SheetContent>
    </Sheet>
  );
}
