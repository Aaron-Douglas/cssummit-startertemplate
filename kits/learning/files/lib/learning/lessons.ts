import { lessons } from "@/content/lessons";
import type { Lesson } from "@/lib/learning/types";

/** Every lesson, in the order listed in content/lessons/index.ts. */
export function getLessons(): Lesson[] {
  return lessons;
}

export function getLesson(slug: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.slug === slug);
}

/** The lessons before and after this one, for "Previous" / "Next" links. */
export function getNeighbours(slug: string): {
  previous?: Lesson;
  next?: Lesson;
} {
  const index = lessons.findIndex((lesson) => lesson.slug === slug);
  if (index === -1) return {};
  return { previous: lessons[index - 1], next: lessons[index + 1] };
}
