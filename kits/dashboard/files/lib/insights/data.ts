/**
 * SAMPLE DATA. Made up for the starter: no real people, sessions or numbers.
 *
 * This is the one file to replace. Every tile, chart and table on /insights is calculated from
 * `sessions` below, so if you keep the same shape (one row per event) the whole page updates.
 *
 * Swapping in your own data:
 * - Edit the rows by hand, or paste rows exported from a spreadsheet (one object per row).
 * - Renamed a column? Change the `Session` type and TypeScript will point at every place
 *   that needs updating (mostly lib/insights/summary.ts).
 * - Loading from a database or API later? Keep the `Session` type and return the same array
 *   from a function; see the kit README.
 */

export type Session = {
  /** Unique id, any string. */
  id: string;
  /** Date of the session as YYYY-MM-DD. */
  date: string;
  /** Chicago community area where it happened. */
  neighborhood: string;
  /** What the workshop was about. Up to five topics look best in the breakdown chart. */
  topic: string;
  /** How many people came. */
  attendees: number;
  /** How many of them came for the first time. */
  firstTimers: number;
  /** Average feedback score, 1 to 5. */
  rating: number;
};

export const dataset = {
  title: "Community tech workshops",
  description:
    "Free evening workshops across six Chicago neighborhoods, January to September 2026.",
  /** Shown above the dashboard so nobody mistakes the sample for real numbers. */
  sampleNotice:
    "Sample data for the starter template. Replace lib/insights/data.ts with your own.",
  /** What one row counts, used in labels ("36 sessions"). */
  unit: { singular: "session", plural: "sessions" },
};

export const sessions: Session[] = [
  {
    id: "s01",
    date: "2026-01-03",
    neighborhood: "Chatham",
    topic: "Build a website",
    attendees: 18,
    firstTimers: 8,
    rating: 4.4,
  },
  {
    id: "s02",
    date: "2026-01-10",
    neighborhood: "Englewood",
    topic: "Data with spreadsheets",
    attendees: 21,
    firstTimers: 10,
    rating: 4.6,
  },
  {
    id: "s03",
    date: "2026-01-19",
    neighborhood: "Pilsen",
    topic: "Build a website",
    attendees: 23,
    firstTimers: 11,
    rating: 3.9,
  },
  {
    id: "s04",
    date: "2026-01-26",
    neighborhood: "Austin",
    topic: "Game design",
    attendees: 24,
    firstTimers: 7,
    rating: 4.4,
  },
  {
    id: "s05",
    date: "2026-02-05",
    neighborhood: "Englewood",
    topic: "Data with spreadsheets",
    attendees: 23,
    firstTimers: 12,
    rating: 4.9,
  },
  {
    id: "s06",
    date: "2026-02-11",
    neighborhood: "Austin",
    topic: "Game design",
    attendees: 21,
    firstTimers: 6,
    rating: 4.2,
  },
  {
    id: "s07",
    date: "2026-02-18",
    neighborhood: "Pilsen",
    topic: "Game design",
    attendees: 23,
    firstTimers: 11,
    rating: 4.9,
  },
  {
    id: "s08",
    date: "2026-02-24",
    neighborhood: "Pilsen",
    topic: "Resumes & LinkedIn",
    attendees: 22,
    firstTimers: 8,
    rating: 4,
  },
  {
    id: "s09",
    date: "2026-03-05",
    neighborhood: "Bronzeville",
    topic: "Build a website",
    attendees: 26,
    firstTimers: 12,
    rating: 4.9,
  },
  {
    id: "s10",
    date: "2026-03-11",
    neighborhood: "Bronzeville",
    topic: "Resumes & LinkedIn",
    attendees: 26,
    firstTimers: 9,
    rating: 4.3,
  },
  {
    id: "s11",
    date: "2026-03-17",
    neighborhood: "Humboldt Park",
    topic: "Data with spreadsheets",
    attendees: 21,
    firstTimers: 11,
    rating: 4.3,
  },
  {
    id: "s12",
    date: "2026-03-26",
    neighborhood: "Humboldt Park",
    topic: "Data with spreadsheets",
    attendees: 24,
    firstTimers: 10,
    rating: 4.6,
  },
  {
    id: "s13",
    date: "2026-04-05",
    neighborhood: "Austin",
    topic: "Data with spreadsheets",
    attendees: 23,
    firstTimers: 10,
    rating: 4.2,
  },
  {
    id: "s14",
    date: "2026-04-10",
    neighborhood: "Austin",
    topic: "Data with spreadsheets",
    attendees: 29,
    firstTimers: 8,
    rating: 4.8,
  },
  {
    id: "s15",
    date: "2026-04-17",
    neighborhood: "Austin",
    topic: "Intro to Python",
    attendees: 27,
    firstTimers: 15,
    rating: 4.1,
  },
  {
    id: "s16",
    date: "2026-04-25",
    neighborhood: "Bronzeville",
    topic: "Resumes & LinkedIn",
    attendees: 30,
    firstTimers: 9,
    rating: 4.9,
  },
  {
    id: "s17",
    date: "2026-05-05",
    neighborhood: "Chatham",
    topic: "Game design",
    attendees: 31,
    firstTimers: 15,
    rating: 4.1,
  },
  {
    id: "s18",
    date: "2026-05-10",
    neighborhood: "Pilsen",
    topic: "Intro to Python",
    attendees: 28,
    firstTimers: 12,
    rating: 4.1,
  },
  {
    id: "s19",
    date: "2026-05-19",
    neighborhood: "Austin",
    topic: "Data with spreadsheets",
    attendees: 24,
    firstTimers: 12,
    rating: 4.1,
  },
  {
    id: "s20",
    date: "2026-05-25",
    neighborhood: "Chatham",
    topic: "Intro to Python",
    attendees: 33,
    firstTimers: 8,
    rating: 4.9,
  },
  {
    id: "s21",
    date: "2026-06-04",
    neighborhood: "Chatham",
    topic: "Intro to Python",
    attendees: 39,
    firstTimers: 12,
    rating: 5,
  },
  {
    id: "s22",
    date: "2026-06-11",
    neighborhood: "Englewood",
    topic: "Build a website",
    attendees: 26,
    firstTimers: 8,
    rating: 4.5,
  },
  {
    id: "s23",
    date: "2026-06-17",
    neighborhood: "Englewood",
    topic: "Data with spreadsheets",
    attendees: 31,
    firstTimers: 12,
    rating: 3.8,
  },
  {
    id: "s24",
    date: "2026-06-24",
    neighborhood: "Chatham",
    topic: "Intro to Python",
    attendees: 36,
    firstTimers: 19,
    rating: 3.8,
  },
  {
    id: "s25",
    date: "2026-07-05",
    neighborhood: "Chatham",
    topic: "Game design",
    attendees: 35,
    firstTimers: 17,
    rating: 4.3,
  },
  {
    id: "s26",
    date: "2026-07-10",
    neighborhood: "Englewood",
    topic: "Game design",
    attendees: 29,
    firstTimers: 9,
    rating: 4.3,
  },
  {
    id: "s27",
    date: "2026-07-19",
    neighborhood: "Humboldt Park",
    topic: "Build a website",
    attendees: 31,
    firstTimers: 15,
    rating: 4.2,
  },
  {
    id: "s28",
    date: "2026-07-26",
    neighborhood: "Austin",
    topic: "Intro to Python",
    attendees: 34,
    firstTimers: 19,
    rating: 5,
  },
  {
    id: "s29",
    date: "2026-08-04",
    neighborhood: "Chatham",
    topic: "Game design",
    attendees: 29,
    firstTimers: 13,
    rating: 4,
  },
  {
    id: "s30",
    date: "2026-08-11",
    neighborhood: "Humboldt Park",
    topic: "Data with spreadsheets",
    attendees: 36,
    firstTimers: 14,
    rating: 4,
  },
  {
    id: "s31",
    date: "2026-08-18",
    neighborhood: "Bronzeville",
    topic: "Data with spreadsheets",
    attendees: 36,
    firstTimers: 15,
    rating: 4.4,
  },
  {
    id: "s32",
    date: "2026-08-26",
    neighborhood: "Austin",
    topic: "Data with spreadsheets",
    attendees: 27,
    firstTimers: 9,
    rating: 4.5,
  },
  {
    id: "s33",
    date: "2026-09-03",
    neighborhood: "Englewood",
    topic: "Build a website",
    attendees: 31,
    firstTimers: 14,
    rating: 4.3,
  },
  {
    id: "s34",
    date: "2026-09-10",
    neighborhood: "Englewood",
    topic: "Game design",
    attendees: 38,
    firstTimers: 20,
    rating: 4.6,
  },
  {
    id: "s35",
    date: "2026-09-19",
    neighborhood: "Bronzeville",
    topic: "Data with spreadsheets",
    attendees: 38,
    firstTimers: 18,
    rating: 4.9,
  },
  {
    id: "s36",
    date: "2026-09-24",
    neighborhood: "Bronzeville",
    topic: "Intro to Python",
    attendees: 39,
    firstTimers: 11,
    rating: 3.8,
  },
];
