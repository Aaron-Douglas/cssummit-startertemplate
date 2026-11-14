import { InfoIcon } from "lucide-react";
import type { Metadata } from "next";
import { Container } from "@/components/container";
import { ChartCard } from "@/components/insights/chart-card";
import {
  AttendanceTrendChart,
  NeighborhoodChart,
  TopicChart,
} from "@/components/insights/charts";
import { SessionsTable } from "@/components/insights/sessions-table";
import { StatTile } from "@/components/insights/stat-tile";
import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { dataset, sessions } from "@/lib/insights/data";
import {
  byMonth,
  byNeighborhood,
  byTopic,
  formatMonth,
  formatNumber,
  stats,
} from "@/lib/insights/summary";

export const metadata: Metadata = {
  title: "Insights",
  description: dataset.description,
};

/**
 * The dashboard. Everything is calculated on the server from lib/insights/data.ts; only the
 * charts and the table run in the browser.
 */
export default function InsightsPage() {
  const months = byMonth(sessions);
  const neighborhoods = byNeighborhood(sessions);
  const topics = byTopic(sessions);
  const { period, tiles } = stats(sessions);

  const first = months[0];
  const last = months[months.length - 1];
  const busiest = neighborhoods[0];
  const topTopic = topics[0];

  return (
    <Container className="flex flex-col gap-10 py-section">
      <PageHeader
        eyebrow="Insights"
        title={dataset.title}
        description={dataset.description}
      />

      <Alert variant="info">
        <InfoIcon />
        <AlertDescription>{dataset.sampleNotice}</AlertDescription>
      </Alert>

      <section aria-labelledby="insights-stats" className="flex flex-col gap-4">
        <h2 id="insights-stats" className="text-xl">
          {period} at a glance
        </h2>
        <div className="grid gap-stack sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((stat) => (
            <StatTile key={stat.label} stat={stat} />
          ))}
        </div>
      </section>

      <div className="grid gap-stack lg:grid-cols-3">
        <ChartCard
          className="lg:col-span-2"
          title="Attendance by month"
          summary={
            first && last
              ? `Monthly attendance went from ${formatNumber(first.attendees)} in ${formatMonth(first.month)} to ${formatNumber(last.attendees)} in ${formatMonth(last.month)}.`
              : "No sessions yet."
          }
          columns={[
            { key: "month", label: "Month" },
            { key: "sessions", label: "Sessions", numeric: true },
            { key: "attendees", label: "Attendees", numeric: true },
            { key: "firstTimers", label: "First-timers", numeric: true },
          ]}
          rows={months.map((point) => ({
            month: formatMonth(point.month),
            sessions: point.sessions,
            attendees: point.attendees,
            firstTimers: point.firstTimers,
          }))}
        >
          <AttendanceTrendChart data={months} />
        </ChartCard>

        <ChartCard
          title="Topics"
          summary={
            topTopic
              ? `${topTopic.name} drew the most people: ${topTopic.share}% of all attendees.`
              : "No sessions yet."
          }
          columns={[
            { key: "name", label: "Topic" },
            { key: "attendees", label: "Attendees", numeric: true },
            { key: "share", label: "Share", numeric: true },
          ]}
          rows={topics.map((topic) => ({
            name: topic.name,
            attendees: topic.attendees,
            share: `${topic.share}%`,
          }))}
        >
          <TopicChart data={topics} />
        </ChartCard>

        <ChartCard
          className="lg:col-span-3"
          title="Attendees by neighborhood"
          summary={
            busiest
              ? `${busiest.name} had the most attendees (${formatNumber(busiest.attendees)} across ${busiest.sessions} sessions).`
              : "No sessions yet."
          }
          columns={[
            { key: "name", label: "Neighborhood" },
            { key: "sessions", label: "Sessions", numeric: true },
            { key: "attendees", label: "Attendees", numeric: true },
          ]}
          rows={neighborhoods.map((group) => ({ ...group }))}
        >
          <NeighborhoodChart data={neighborhoods} />
        </ChartCard>
      </div>

      <section aria-labelledby="insights-table" className="flex flex-col gap-4">
        <h2 id="insights-table" className="text-xl">
          All sessions
        </h2>
        <SessionsTable rows={sessions} />
      </section>
    </Container>
  );
}
