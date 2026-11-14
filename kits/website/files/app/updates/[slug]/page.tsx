import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UpdateBody } from "@/components/website/update-body";
import { formatUpdateDate, getUpdate, getUpdates } from "@/lib/website/updates";

type Props = { params: Promise<{ slug: string }> };

/** Builds every post listed in content/updates/index.ts as a static page. */
export function generateStaticParams() {
  return getUpdates().map((update) => ({ slug: update.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const update = getUpdate(slug);
  if (!update) return { title: "Update not found" };
  return {
    title: update.title,
    description: update.summary,
    openGraph: {
      type: "article",
      title: update.title,
      description: update.summary,
      publishedTime: update.date,
    },
  };
}

export default function UpdatePage({ params }: Props) {
  return (
    <Container size="narrow" className="flex flex-col gap-8 py-section">
      <Button asChild variant="ghost" size="sm" className="-ml-3 self-start">
        <Link href="/updates">
          <ArrowLeftIcon />
          All updates
        </Link>
      </Button>
      {/* Reading `params` is URL data, so it sits inside <Suspense>: navigation shows the page
          shell (and this fallback) instantly. Every post is prerendered, so the fallback is
          rarely seen. */}
      <Suspense fallback={<UpdateSkeleton />}>
        <UpdateArticle params={params} />
      </Suspense>
    </Container>
  );
}

async function UpdateArticle({ params }: Props) {
  const { slug } = await params;
  const update = getUpdate(slug);
  if (!update) notFound();

  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 border-b pb-8">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <time dateTime={update.date}>{formatUpdateDate(update.date)}</time>
          {update.tag ? <Badge variant="tint">{update.tag}</Badge> : null}
        </div>
        <h1 className="text-4xl sm:text-5xl">{update.title}</h1>
        <p className="text-lg text-pretty text-muted-foreground">
          {update.summary}
        </p>
      </header>
      <UpdateBody blocks={update.body} />
    </article>
  );
}

function UpdateSkeleton() {
  return (
    <div
      aria-hidden
      className="flex animate-pulse flex-col gap-6 motion-reduce:animate-none"
    >
      <div className="h-4 w-32 rounded-badge bg-muted" />
      <div className="h-12 w-3/4 rounded-control bg-muted" />
      <div className="h-5 w-full rounded-control bg-muted" />
      <div className="h-5 w-2/3 rounded-control bg-muted" />
    </div>
  );
}
