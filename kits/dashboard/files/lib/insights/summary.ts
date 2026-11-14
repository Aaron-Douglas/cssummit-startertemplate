import type { Session } from "./data";

/**
 * Everything on /insights is calculated here from the rows in data.ts. Plain functions, no
 * React, so they run on the server and are easy to test or change.
 */

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const numberFormat = new Intl.NumberFormat("en-US");

export function formatNumber(value: number) {
  return numberFormat.format(value);
}

/** "2026-03" → "Mar 2026" (no locale lookups, so server and browser always agree). */
export function formatMonth(month: string, withYear = true) {
  const [year, m] = month.split("-");
  const name = MONTHS[Number(m) - 1] ?? month;
  return withYear ? `${name} ${year}` : name;
}

/** "2026-03-05" → "Mar 5, 2026". */
export function formatDate(date: string) {
  const [year, m, d] = date.split("-");
  return `${MONTHS[Number(m) - 1] ?? m} ${Number(d)}, ${year}`;
}

function sum(rows: Session[], pick: (row: Session) => number) {
  return rows.reduce((total, row) => total + pick(row), 0);
}

function round(value: number, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export type MonthPoint = {
  month: string;
  label: string;
  attendees: number;
  firstTimers: number;
  sessions: number;
};

/** Attendance per month, oldest first. */
export function byMonth(rows: Session[]): MonthPoint[] {
  const groups = new Map<string, Session[]>();
  for (const row of rows) {
    const month = row.date.slice(0, 7);
    groups.set(month, [...(groups.get(month) ?? []), row]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, group]) => ({
      month,
      label: formatMonth(month, false),
      attendees: sum(group, (row) => row.attendees),
      firstTimers: sum(group, (row) => row.firstTimers),
      sessions: group.length,
    }));
}

export type GroupPoint = { name: string; attendees: number; sessions: number };

function groupBy(rows: Session[], key: (row: Session) => string) {
  const groups = new Map<string, GroupPoint>();
  for (const row of rows) {
    const name = key(row);
    const current = groups.get(name) ?? { name, attendees: 0, sessions: 0 };
    current.attendees += row.attendees;
    current.sessions += 1;
    groups.set(name, current);
  }
  return [...groups.values()].sort((a, b) => b.attendees - a.attendees);
}

/** Total attendance per neighborhood, biggest first. */
export function byNeighborhood(rows: Session[]) {
  return groupBy(rows, (row) => row.neighborhood);
}

export type SharePoint = GroupPoint & { share: number };

/**
 * Attendance per topic with its share of the total. Keeps the top four and folds the rest
 * into "Other" so the breakdown never needs more than the five chart colours.
 */
export function byTopic(rows: Session[]): SharePoint[] {
  const groups = groupBy(rows, (row) => row.topic);
  const top = groups.length > 5 ? groups.slice(0, 4) : groups;
  const rest = groups.length > 5 ? groups.slice(4) : [];
  if (rest.length) {
    top.push({
      name: "Other",
      attendees: rest.reduce((total, group) => total + group.attendees, 0),
      sessions: rest.reduce((total, group) => total + group.sessions, 0),
    });
  }
  const total = top.reduce((all, group) => all + group.attendees, 0) || 1;
  return top.map((group) => ({
    ...group,
    share: round((group.attendees / total) * 100),
  }));
}

export type Stat = {
  label: string;
  value: string;
  /** Change against the previous period; undefined when there is nothing to compare. */
  change?: {
    value: number;
    display: string;
    direction: "up" | "down" | "flat";
  };
  hint: string;
};

function change(
  current: number,
  previous: number,
  mode: "percent" | "points",
  unit = "",
): Stat["change"] {
  if (!Number.isFinite(previous) || (mode === "percent" && previous === 0)) {
    return undefined;
  }
  const value =
    mode === "percent"
      ? round(((current - previous) / previous) * 100)
      : round(current - previous);
  const direction = value > 0 ? "up" : value < 0 ? "down" : "flat";
  const sign = value > 0 ? "+" : "";
  const display =
    mode === "percent" ? `${sign}${value}%` : `${sign}${value}${unit}`;
  return { value, display, direction };
}

/**
 * The stat tiles: the latest `periodMonths` months against the months just before them.
 * With sample data that is Jul–Sep against Apr–Jun.
 */
export function stats(rows: Session[], periodMonths = 3) {
  const months = [...new Set(rows.map((row) => row.date.slice(0, 7)))].sort();
  const currentMonths = new Set(months.slice(-periodMonths));
  const previousMonths = new Set(
    months.slice(-periodMonths * 2, -periodMonths),
  );
  const current = rows.filter((row) => currentMonths.has(row.date.slice(0, 7)));
  const previous = rows.filter((row) =>
    previousMonths.has(row.date.slice(0, 7)),
  );
  const hasPrevious = previous.length > 0;

  const attendees = sum(current, (row) => row.attendees);
  const prevAttendees = sum(previous, (row) => row.attendees);
  const perSession = attendees / (current.length || 1);
  const prevPerSession = prevAttendees / (previous.length || 1);
  const firstShare =
    (sum(current, (row) => row.firstTimers) / (attendees || 1)) * 100;
  const prevFirstShare =
    (sum(previous, (row) => row.firstTimers) / (prevAttendees || 1)) * 100;
  const rating = sum(current, (row) => row.rating) / (current.length || 1);
  const prevRating =
    sum(previous, (row) => row.rating) / (previous.length || 1);

  const sortedCurrent = [...currentMonths];
  const period =
    sortedCurrent.length > 1
      ? `${formatMonth(sortedCurrent[0], false)}–${formatMonth(sortedCurrent[sortedCurrent.length - 1])}`
      : formatMonth(sortedCurrent[0] ?? "");
  const compared = hasPrevious
    ? `vs the ${previousMonths.size} months before`
    : "no earlier data to compare";

  const tiles: Stat[] = [
    {
      label: "Attendees",
      value: formatNumber(attendees),
      change: hasPrevious
        ? change(attendees, prevAttendees, "percent")
        : undefined,
      hint: compared,
    },
    {
      label: "Average per session",
      value: formatNumber(round(perSession)),
      change: hasPrevious
        ? change(perSession, prevPerSession, "percent")
        : undefined,
      hint: compared,
    },
    {
      label: "First-timers",
      value: `${round(firstShare)}%`,
      change: hasPrevious
        ? change(firstShare, prevFirstShare, "points", " pts")
        : undefined,
      hint: "share of attendees who were new",
    },
    {
      label: "Average rating",
      value: `${round(rating)} / 5`,
      change: hasPrevious ? change(rating, prevRating, "points") : undefined,
      hint: "from feedback forms",
    },
  ];

  return { period, tiles };
}
