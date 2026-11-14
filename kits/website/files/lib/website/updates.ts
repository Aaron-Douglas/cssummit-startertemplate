import { updates } from "@/content/updates";

/**
 * Types and helpers for the posts in content/updates/.
 *
 * A post's body is a list of blocks. Each block is one of:
 *   "A plain string"                  → a paragraph
 *   { heading: "A heading" }          → a subheading
 *   { list: ["one", "two", "three"] } → a bulleted list
 */
export type UpdateBlock = string | { heading: string } | { list: string[] };

export type Update = {
  /** The URL: /updates/<slug>. Lowercase words joined by dashes, unique per post. */
  slug: string;
  title: string;
  /** "YYYY-MM-DD". Posts are listed newest first. */
  date: string;
  /** One or two sentences shown on the list page and in link previews. */
  summary: string;
  /** Optional short label, for example "Event" or "Build log". */
  tag?: string;
  body: UpdateBlock[];
};

/** Every post, newest first. */
export function getUpdates(): Update[] {
  return [...updates].sort((a, b) => b.date.localeCompare(a.date));
}

export function getUpdate(slug: string): Update | undefined {
  return updates.find((update) => update.slug === slug);
}

const dateFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  // Dates are plain calendar days, so format them in UTC to avoid an off-by-one day.
  timeZone: "UTC",
});

/** "2026-11-14" → "November 14, 2026". */
export function formatUpdateDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? date : dateFormat.format(parsed);
}
