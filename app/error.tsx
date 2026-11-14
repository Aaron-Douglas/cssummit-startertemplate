"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // Shows up in the browser console and in your terminal during `pnpm dev`.
    console.error(error);
  }, [error]);

  return (
    <Container className="flex min-h-[60vh] flex-col items-start justify-center gap-6 py-section">
      <p className="eyebrow">Something broke</p>
      <h1 className="text-5xl sm:text-6xl">This page hit an error.</h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        Try again. If it keeps happening, check the terminal running{" "}
        <code className="font-mono text-foreground">pnpm dev</code>, or paste
        the error into Claude Code.
        {error.digest ? (
          <span className="mt-2 block font-mono text-sm">
            Error id: {error.digest}
          </span>
        ) : null}
      </p>
      <div className="flex flex-wrap gap-4">
        <Button size="lg" onClick={() => retry()}>
          Try again
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </Container>
  );
}
