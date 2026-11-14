import Link from "next/link";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-start justify-center gap-6 py-section">
      <p className="eyebrow">Error 404</p>
      <h1 className="text-5xl sm:text-7xl">This page isn’t built yet.</h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        The link may be wrong, or the page belongs to a kit that hasn’t been
        added. Run{" "}
        <code className="font-mono text-foreground">pnpm kit list</code> to see
        what’s installed.
      </p>
      <Button asChild size="lg">
        <Link href="/">Back home</Link>
      </Button>
    </Container>
  );
}
