import { useSyncExternalStore } from "react";
import { config } from "@/lib/game/config";

/**
 * High scores, saved in this browser's localStorage. `useHighScores()` is `null` on the server
 * and during the first render in the browser, then the saved list. That keeps the server HTML
 * and the first browser render identical (no hydration mismatch).
 *
 * For a shared, all-players leaderboard, replace `read`/`save` with calls to your database.
 */

export type HighScore = { score: number; date: string };

const STORAGE_KEY = "game-high-scores-v1";
const CHANGE_EVENT = "game-high-scores-change";
const EMPTY: HighScore[] = [];

let cachedRaw: string | null | undefined;
let cachedValue: HighScore[] = EMPTY;

function read(): HighScore[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage blocked: behave as if there are no scores.
  }
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  cachedValue = parse(raw);
  return cachedValue;
}

function parse(raw: string | null): HighScore[] {
  if (!raw) return EMPTY;
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return EMPTY;
    return data
      .filter(
        (entry): entry is HighScore =>
          typeof entry?.score === "number" && typeof entry?.date === "string",
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, config.highScores.keep);
  } catch {
    return EMPTY;
  }
}

function save(scores: HighScore[]) {
  try {
    if (scores.length === 0) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  } catch {
    // Storage full or blocked: scores just won't be remembered.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function useHighScores(): HighScore[] | null {
  return useSyncExternalStore<HighScore[] | null>(subscribe, read, () => null);
}

/**
 * Record a finished game. Returns its place in the table (0 = new best), or -1 if it didn't
 * make the list. Scores of 0 are not saved.
 */
export function addHighScore(score: number): number {
  if (score <= 0) return -1;
  const entry: HighScore = { score, date: new Date().toISOString() };
  const next = [...read(), entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, config.highScores.keep);
  const place = next.indexOf(entry);
  if (place !== -1) save(next);
  return place;
}

export function clearHighScores() {
  save([]);
}
