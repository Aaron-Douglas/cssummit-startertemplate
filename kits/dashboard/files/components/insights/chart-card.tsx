import type * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Column = { key: string; label: string; numeric?: boolean };

/**
 * A chart in a card, with the accessible extras every chart needs: a one-sentence summary
 * (read first by screen readers, useful to everyone) and the numbers as a table behind
 * "Show the data".
 */
export function ChartCard({
  title,
  summary,
  columns,
  rows,
  className,
  children,
}: {
  title: string;
  /** One sentence that states what the chart shows, in words. */
  summary: string;
  columns: Column[];
  rows: Record<string, string | number>[];
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={cn("min-w-0", className)}>
      <CardHeader>
        <CardTitle>
          <h2 className="text-lg">{title}</h2>
        </CardTitle>
        <CardDescription>{summary}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <figure className="m-0" aria-label={title}>
          {children}
        </figure>
        <details className="group text-sm">
          <summary className="w-fit cursor-pointer rounded-control text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            Show the data
          </summary>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">{title}</caption>
              <thead className="text-muted-foreground">
                <tr className="border-b">
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className={cn(
                        "py-2 pr-4 font-medium",
                        column.numeric && "text-right",
                      )}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={String(row[columns[0].key])}
                    className="border-b last:border-0"
                  >
                    {columns.map((column, index) =>
                      index === 0 ? (
                        <th
                          key={column.key}
                          scope="row"
                          className="py-2 pr-4 font-normal"
                        >
                          {row[column.key]}
                        </th>
                      ) : (
                        <td
                          key={column.key}
                          className={cn(
                            "py-2 pr-4",
                            column.numeric && "text-right tabular-nums",
                          )}
                        >
                          {row[column.key]}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}
