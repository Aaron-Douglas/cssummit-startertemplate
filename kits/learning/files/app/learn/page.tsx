import { ArrowRightIcon, ClockIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import {
  LessonStatus,
  ProgressSummary,
} from "@/components/learning/progress-status";
import { PageHeader } from "@/components/page-header";
import { getLessons } from "@/lib/learning/lessons";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "Short lessons with a quiz at the end. Your progress is saved on this device.",
};

export default function LearnPage() {
  const lessons = getLessons();

  return (
    <Container size="narrow" className="flex flex-col gap-10 py-section">
      <PageHeader
        eyebrow="Learn"
        title="Quantum, explained plainly"
        description="Three short lessons with a quiz at the end of each. No sign-up: your progress is saved on this device."
      />

      <ProgressSummary slugs={lessons.map((lesson) => lesson.slug)} />

      <ol className="flex flex-col gap-stack">
        {lessons.map((lesson, index) => (
          <li key={lesson.slug}>
            <article className="surface group relative flex flex-col gap-3 rounded-card p-card transition-colors focus-within:border-ring hover:border-primary">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-sm text-primary-text">
                  Lesson {index + 1}
                </span>
                {/* Above the stretched link so it stays readable on hover. */}
                <div className="relative z-10">
                  <LessonStatus slug={lesson.slug} />
                </div>
              </div>
              <h2 className="text-2xl">
                <Link
                  href={`/learn/${lesson.slug}`}
                  className="outline-none after:absolute after:inset-0 after:rounded-card focus-visible:underline"
                >
                  {lesson.title}
                </Link>
              </h2>
              <p className="text-muted-foreground">{lesson.summary}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <ClockIcon className="size-4" aria-hidden />
                  {lesson.minutes} min read
                </span>
                <span>{lesson.quiz.length} quiz questions</span>
                <span
                  aria-hidden
                  className="ml-auto inline-flex items-center gap-1.5 font-medium text-primary-text"
                >
                  Start
                  <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
                </span>
              </div>
            </article>
          </li>
        ))}
      </ol>
    </Container>
  );
}
