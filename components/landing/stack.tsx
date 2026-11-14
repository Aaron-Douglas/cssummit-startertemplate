import { Container, Section } from "@/components/container";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./section-heading";

const core = [
  { name: "Next.js 16", role: "App Router, server components" },
  { name: "React 19", role: "UI" },
  { name: "TypeScript", role: "Strict types" },
  { name: "Tailwind CSS 4", role: "Styling with design tokens" },
  { name: "shadcn/ui", role: "Components you own and edit" },
  { name: "Biome", role: "Lint and format in one tool" },
];

const extras = [
  { name: "Supabase", kit: "app" },
  { name: "Claude API", kit: "chatbot" },
  { name: "Recharts", kit: "dashboard" },
  { name: "MapLibre", kit: "map" },
];

export function Stack() {
  return (
    <Section id="stack" className="border-y bg-card/40">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.4fr] layout-centered:lg:grid-cols-1">
        <SectionHeading eyebrow="The stack" title="Boring tech, on purpose.">
          The tools working developers use, so the docs, tutorials and Stack
          Overflow answers all apply.
        </SectionHeading>
        <div className="flex flex-col gap-8">
          <dl
            className={cn(
              "grid gap-px overflow-hidden rounded-card border bg-border sm:grid-cols-2",
            )}
          >
            {core.map((item) => (
              <div
                key={item.name}
                className="flex flex-col gap-1 bg-background p-5"
              >
                <dt className="font-heading text-lg font-semibold">
                  {item.name}
                </dt>
                <dd className="text-sm text-muted-foreground">{item.role}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-col gap-3">
            <p className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
              Added by kits, only if you pick them
            </p>
            <ul className="flex flex-wrap gap-2">
              {extras.map((item) => (
                <li
                  key={item.name}
                  className="inline-flex items-center gap-2 rounded-badge border px-3 py-1.5 text-sm"
                >
                  {item.name}
                  <span className="font-mono text-xs text-primary-text">
                    {item.kit}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
