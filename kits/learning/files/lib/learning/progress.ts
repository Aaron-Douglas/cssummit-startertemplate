import { useSyncExternalStore } from "react";

/**
 * Lesson progress, saved in the browser's localStorage (per device, no account needed).
 *
 * Components read it with `useProgress()`. On the server, and during the first render in the
 * browser, it is `null` ("not loaded yet"), then React swaps in the saved value. That keeps the
 * server HTML and the first browser render identical, so there is no hydration mismatch.
 *
 * To sync progress across devices later, replace `read`/`write` with calls to your database.
 */

export type LessonProgress = {
  /** Best quiz score so far. */
  bestScore: number;
  /** Number of questions in the quiz when it was taken. */
  total: number;
  /** ISO date of the last time the quiz was finished. */
  completedAt: string;
};

export type Progress = Record<string, LessonProgress>;

const STORAGE_KEY = "learning-progress-v1";
const CHANGE_EVENT = "learning-progress-change";

const EMPTY: Progress = {};
let cachedRaw: string | null | undefined;
let cachedValue: Progress = EMPTY;

function read(): Progress {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Private mode or storage blocked: behave as if nothing is saved.
  }
  // useSyncExternalStore needs the same object back while nothing changed.
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  cachedValue = parse(raw);
  return cachedValue;
}

function parse(raw: string | null): Progress {
  if (!raw) return EMPTY;
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object") return EMPTY;
    const result: Progress = {};
    for (const [slug, value] of Object.entries(data)) {
      const entry = value as Partial<LessonProgress>;
      if (
        typeof entry?.bestScore === "number" &&
        typeof entry.total === "number"
      ) {
        result[slug] = {
          bestScore: entry.bestScore,
          total: entry.total,
          completedAt: String(entry.completedAt ?? ""),
        };
      }
    }
    return result;
  } catch {
    return EMPTY;
  }
}

function write(progress: Progress) {
  try {
    if (Object.keys(progress).length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
  } catch {
    // Storage full or blocked: progress just won't be remembered.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  // "storage" fires when another tab changes it; our own event covers this tab.
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/** Saved progress, or `null` before it has loaded in the browser. */
export function useProgress(): Progress | null {
  return useSyncExternalStore<Progress | null>(subscribe, read, () => null);
}

/** Record a finished quiz. Keeps the best score. */
export function saveQuizResult(slug: string, score: number, total: number) {
  const current = read();
  const previous = current[slug];
  write({
    ...current,
    [slug]: {
      bestScore: Math.max(score, previous?.bestScore ?? 0),
      total,
      completedAt: new Date().toISOString(),
    },
  });
}

/** Forget one lesson, or every lesson when no slug is given. */
export function resetProgress(slug?: string) {
  if (!slug) {
    write({});
    return;
  }
  const { [slug]: _removed, ...rest } = read();
  write(rest);
}
