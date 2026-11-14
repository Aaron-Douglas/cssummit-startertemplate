"use client";

import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Session } from "@/lib/insights/data";
import { formatDate } from "@/lib/insights/summary";
import { cn } from "@/lib/utils";

type SortKey = keyof Pick<
  Session,
  "date" | "neighborhood" | "topic" | "attendees" | "firstTimers" | "rating"
>;

const COLUMNS: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: "date", label: "Date" },
  { key: "neighborhood", label: "Neighborhood" },
  { key: "topic", label: "Topic" },
  { key: "attendees", label: "Attendees", numeric: true },
  { key: "firstTimers", label: "First-timers", numeric: true },
  { key: "rating", label: "Rating", numeric: true },
];

const ALL = "all";

const selectClass =
  "h-control w-full min-w-0 rounded-control border border-input bg-background/40 px-3 text-base text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";

/** Every row from data.ts, with search, two filters and sortable columns. */
export function SessionsTable({ rows }: { rows: Session[] }) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [neighborhood, setNeighborhood] = useState(ALL);
  const [topic, setTopic] = useState(ALL);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "date",
    dir: "desc",
  });

  const neighborhoods = useMemo(
    () => [...new Set(rows.map((row) => row.neighborhood))].sort(),
    [rows],
  );
  const topics = useMemo(
    () => [...new Set(rows.map((row) => row.topic))].sort(),
    [rows],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = rows.filter(
      (row) =>
        (neighborhood === ALL || row.neighborhood === neighborhood) &&
        (topic === ALL || row.topic === topic) &&
        (!q ||
          `${row.neighborhood} ${row.topic} ${formatDate(row.date)}`
            .toLowerCase()
            .includes(q)),
    );
    const factor = sort.dir === "asc" ? 1 : -1;
    return filtered.sort((a, b) => {
      const x = a[sort.key];
      const y = b[sort.key];
      const order =
        typeof x === "number" && typeof y === "number"
          ? x - y
          : String(x).localeCompare(String(y));
      return order * factor;
    });
  }, [rows, query, neighborhood, topic, sort]);

  const filtersOn = query !== "" || neighborhood !== ALL || topic !== ALL;

  function toggleSort(key: SortKey) {
    setSort((current) =>
      current.key === key
        ? { key, dir: current.dir === "asc" ? "desc" : "asc" }
        : {
            key,
            dir: key === "neighborhood" || key === "topic" ? "asc" : "desc",
          },
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${id}-search`}>Search</Label>
          <Input
            id={`${id}-search`}
            type="search"
            placeholder="Neighborhood, topic, month…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${id}-neighborhood`}>Neighborhood</Label>
          <select
            id={`${id}-neighborhood`}
            className={selectClass}
            value={neighborhood}
            onChange={(event) => setNeighborhood(event.target.value)}
          >
            <option value={ALL}>All neighborhoods</option>
            {neighborhoods.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${id}-topic`}>Topic</Label>
          <select
            id={`${id}-topic`}
            className={selectClass}
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
          >
            <option value={ALL}>All topics</option>
            {topics.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <p aria-live="polite">
          Showing {visible.length} of {rows.length} sessions
        </p>
        {filtersOn ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setNeighborhood(ALL);
              setTopic(ALL);
            }}
          >
            Clear filters
          </Button>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-card border">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <caption className="sr-only">
            Workshop sessions. Select a column heading to sort.
          </caption>
          <thead className="bg-muted/40 text-muted-foreground">
            <tr className="border-b">
              {COLUMNS.map((column) => {
                const active = sort.key === column.key;
                const Icon = !active
                  ? ArrowUpDownIcon
                  : sort.dir === "asc"
                    ? ArrowUpIcon
                    : ArrowDownIcon;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={
                      active
                        ? sort.dir === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                    className={cn(
                      "px-3 py-2 font-medium",
                      column.numeric && "text-right",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-control hover:text-foreground",
                        active && "text-foreground",
                        column.numeric && "flex-row-reverse",
                      )}
                    >
                      {column.label}
                      <Icon aria-hidden className="size-3.5" />
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id} className="border-b last:border-0">
                <td className="px-3 py-2 whitespace-nowrap">
                  {formatDate(row.date)}
                </td>
                <td className="px-3 py-2">{row.neighborhood}</td>
                <td className="px-3 py-2">{row.topic}</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {row.attendees}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {row.firstTimers}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {row.rating.toFixed(1)}
                </td>
              </tr>
            ))}
            {visible.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className="px-3 py-8 text-center text-muted-foreground"
                >
                  No sessions match. Try clearing the filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
