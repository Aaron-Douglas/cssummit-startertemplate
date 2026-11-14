"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  GroupPoint,
  MonthPoint,
  SharePoint,
} from "@/lib/insights/summary";

/**
 * The three charts. Colours are CSS variables from the design system (`--chart-1` … `--chart-5`,
 * `--border`, `--muted-foreground`), so they follow whatever design the team picked. Recharts
 * accepts any CSS colour, including `var(...)`.
 */

const SERIES = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const axisTick = { fill: "var(--muted-foreground)", fontSize: 12 };
const axisLine = { stroke: "var(--border)" };

type TooltipItem = {
  name?: string | number;
  value?: string | number | (string | number)[];
  color?: string;
  payload?: { fill?: string };
};

/** Tooltip drawn with the design tokens (Recharts' default one is white). */
function ChartTooltip({
  active,
  payload,
  label,
  unit = "attendees",
}: {
  active?: boolean;
  payload?: readonly TooltipItem[];
  label?: string | number;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="surface flex min-w-36 flex-col gap-1.5 rounded-control bg-popover px-3 py-2 text-xs text-popover-foreground">
      {label !== undefined && label !== "" ? (
        <p className="font-semibold">{label}</p>
      ) : null}
      {payload.map((item) => (
        <div key={String(item.name)} className="flex items-center gap-2">
          <span
            aria-hidden
            className="size-2.5 shrink-0 rounded-badge"
            style={{ background: item.color ?? item.payload?.fill }}
          />
          <span className="text-muted-foreground">{item.name}</span>
          <span className="ml-auto pl-3 font-semibold tabular-nums">
            {String(item.value)} {unit}
          </span>
        </div>
      ))}
    </div>
  );
}

/** A legend as plain HTML, so it wraps nicely on phones and reads as text. */
export function ChartLegend({
  items,
}: {
  items: { label: string; color: string }[];
}) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="size-2.5 shrink-0 rounded-badge"
            style={{ background: item.color }}
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

/** Area chart: attendees and first-timers per month. */
export function AttendanceTrendChart({ data }: { data: MonthPoint[] }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
          >
            <defs>
              <linearGradient id="insights-fill-1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={SERIES[0]} stopOpacity={0.35} />
                <stop offset="100%" stopColor={SERIES[0]} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="insights-fill-2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={SERIES[1]} stopOpacity={0.3} />
                <stop offset="100%" stopColor={SERIES[1]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tick={axisTick}
              axisLine={axisLine}
              tickLine={false}
            />
            <YAxis
              tick={axisTick}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: "var(--muted-foreground)" }}
            />
            <Area
              type="monotone"
              dataKey="attendees"
              name="All attendees"
              stroke={SERIES[0]}
              strokeWidth={2}
              fill="url(#insights-fill-1)"
            />
            <Area
              type="monotone"
              dataKey="firstTimers"
              name="First-timers"
              stroke={SERIES[1]}
              strokeWidth={2}
              fill="url(#insights-fill-2)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <ChartLegend
        items={[
          { label: "All attendees", color: SERIES[0] },
          { label: "First-timers", color: SERIES[1] },
        ]}
      />
    </div>
  );
}

/** Horizontal bars: total attendees per neighborhood (labels stay readable on phones). */
export function NeighborhoodChart({ data }: { data: GroupPoint[] }) {
  return (
    <div className="w-full" style={{ height: Math.max(200, data.length * 40) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
        >
          <CartesianGrid
            stroke="var(--border)"
            strokeDasharray="3 3"
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={axisTick}
            axisLine={axisLine}
            tickLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={104}
            tick={axisTick}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: "var(--muted)", fillOpacity: 0.5 }}
          />
          <Bar
            dataKey="attendees"
            name="Attendees"
            fill={SERIES[0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Donut: share of attendees per topic. */
export function TopicChart({ data }: { data: SharePoint[] }) {
  const slices = data.map((item, index) => ({
    ...item,
    fill: SERIES[index % SERIES.length],
  }));
  return (
    <div className="flex flex-col gap-3">
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<ChartTooltip />} />
            <Pie
              data={slices}
              dataKey="attendees"
              nameKey="name"
              innerRadius="55%"
              outerRadius="85%"
              paddingAngle={2}
              stroke="var(--card)"
              strokeWidth={2}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ChartLegend
        items={slices.map((slice) => ({
          label: `${slice.name} (${slice.share}%)`,
          color: slice.fill,
        }))}
      />
    </div>
  );
}
