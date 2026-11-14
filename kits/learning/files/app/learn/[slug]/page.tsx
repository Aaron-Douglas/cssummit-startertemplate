import { ArrowLeftIcon, ArrowRightIcon, ClockIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/container";
import { LessonStatus } from "@/components/learning/progress-status";
import { Quiz } from "@/components/learning/quiz";
import { Button } from "@/components/ui/button";
import { getLesson, getLessons, getNeighbours } from "@/lib/learning/lessons";

type Props = { params: Promise<{ slug: string }> };

/** Builds every lesson listed in content/lessons/index.ts as a static page. */
export function generateStaticParams() {
  return getLessons().map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) return { title: "Lesson not found" };
  return { title: lesson.title, description: lesson.summary };
}

function sectionId(index: number) {
  return `section-${index + 1}`;
}

export default function LessonPage({ params }: Props) {
  return (
    <Container size="narrow" className="flex flex-col gap-10 py-section">
      <Button asChild variant="ghost" size="sm" className="-ml-3 self-start">
        <Link href="/learn">
          <ArrowLeftIcon />
          All lessons
        </Link>
      </Button>
      {/* Reading `params` is URL data, so it sits inside <Suspense>: navigation shows the page
          shell (and this fallback) instantly. Every lesson is prerendered, so the fallback is
          rarely seen. */}
      <Suspense fallback={<LessonSkeleton />}>
        <LessonContent params={params} />
      </Suspense>
    </Container>
  );
}

function LessonSkeleton() {
  return (
    <div
      aria-hidden
      className="flex animate-pulse flex-col gap-6 motion-reduce:animate-none"
    >
      <div className="h-4 w-40 rounded-badge bg-muted" />
      <div className="h-12 w-3/4 rounded-control bg-muted" />
      <div className="h-5 w-full rounded-control bg-muted" />
      <div className="h-5 w-2/3 rounded-control bg-muted" />
    </div>
  );
}

async function LessonContent({ params }: Props) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();
  const { previous, next } = getNeighbours(slug);

  return (
    <>
      <article className="flex flex-col gap-10">
        <header className="flex flex-col gap-4 border-b pb-8">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="eyebrow">Lesson</span>
            <span className="inline-flex items-center gap-1.5">
              <ClockIcon className="size-4" aria-hidden />
              {lesson.minutes} min read
            </span>
            <LessonStatus slug={lesson.slug} />
          </div>
          <h1 className="text-4xl sm:text-5xl">{lesson.title}</h1>
          <p className="text-lg text-pretty text-muted-foreground">
            {lesson.summary}
          </p>
        </header>

        <nav aria-label="In this lesson" className="flex flex-col gap-3">
          <p className="text-sm font-medium">In this lesson</p>
          <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm text-muted-foreground marker:text-primary-text">
            {lesson.sections.map((section, index) => (
              <li key={section.heading}>
                <a
                  href={`#${sectionId(index)}`}
                  className="underline-offset-4 hover:text-foreground hover:underline"
                >
                  {section.heading}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#quiz"
                className="underline-offset-4 hover:text-foreground hover:underline"
              >
                Quiz
              </a>
            </li>
          </ol>
        </nav>

        {lesson.sections.map((section, index) => (
          <section
            key={section.heading}
            id={sectionId(index)}
            aria-labelledby={`${sectionId(index)}-heading`}
            className="flex scroll-mt-24 flex-col gap-4"
          >
            <h2
              id={`${sectionId(index)}-heading`}
              className="text-2xl sm:text-3xl"
            >
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg"
              >
                {paragraph}
              </p>
            ))}
            {section.points?.length ? (
              <ul className="flex list-disc flex-col gap-2 rounded-card bg-primary-tint p-card pl-10 text-foreground marker:text-primary-text">
                {section.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        <section
          id="quiz"
          aria-labelledby="quiz-heading"
          className="flex scroll-mt-24 flex-col gap-6 border-t pt-10"
        >
          <div className="flex flex-col gap-2">
            <p className="eyebrow">Quiz</p>
            <h2 id="quiz-heading" className="text-2xl sm:text-3xl">
              Check what you learned
            </h2>
          </div>
          <Quiz slug={lesson.slug} questions={lesson.quiz} />
        </section>
      </article>

      <nav
        aria-label="More lessons"
        className="grid gap-stack border-t pt-8 sm:grid-cols-2"
      >
        {previous ? (
          <Link
            href={`/learn/${previous.slug}`}
            className="surface flex flex-col gap-1 rounded-card p-card transition-colors hover:border-primary focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none"
          >
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <ArrowLeftIcon className="size-4" aria-hidden />
              Previous
            </span>
            <span className="font-medium">{previous.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/learn/${next.slug}`}
            className="surface flex flex-col items-end gap-1 rounded-card p-card text-right transition-colors hover:border-primary focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none"
          >
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              Next
              <ArrowRightIcon className="size-4" aria-hidden />
            </span>
            <span className="font-medium">{next.title}</span>
          </Link>
        ) : null}
      </nav>
    </>
  );
}
