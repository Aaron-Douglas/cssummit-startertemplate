import { ArrowRightIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { formatUpdateDate, getUpdates } from "@/lib/website/updates";

export const metadata: Metadata = {
  title: "Updates",
  description: "News, build logs and what we're learning as we go.",
};

export default function UpdatesPage() {
  const updates = getUpdates();

  return (
    <Container size="narrow" className="flex flex-col gap-10 py-section">
      <PageHeader
        eyebrow="Updates"
        title="What we're up to"
        description="News, build logs and what we're learning as we go."
      />

      {updates.length === 0 ? (
        <p className="text-muted-foreground">
          No posts yet. Add one in content/updates/.
        </p>
      ) : (
        <ol className="flex flex-col gap-stack">
          {updates.map((update) => (
            <li key={update.slug}>
              <article className="surface group relative flex flex-col gap-3 rounded-card p-card transition-colors focus-within:border-ring hover:border-primary">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <time dateTime={update.date}>
                    {formatUpdateDate(update.date)}
                  </time>
                  {update.tag ? (
                    <Badge variant="tint">{update.tag}</Badge>
                  ) : null}
                </div>
                <h2 className="text-2xl">
                  <Link
                    href={`/updates/${update.slug}`}
                    className="outline-none after:absolute after:inset-0 after:rounded-card focus-visible:underline"
                  >
                    {update.title}
                  </Link>
                </h2>
                <p className="text-muted-foreground">{update.summary}</p>
                <span
                  aria-hidden
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-text"
                >
                  Read more
                  <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </article>
            </li>
          ))}
        </ol>
      )}
    </Container>
  );
}
