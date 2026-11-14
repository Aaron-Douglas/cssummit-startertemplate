import { BlocksIcon, PaletteIcon, TerminalSquareIcon } from "lucide-react";
import type * as React from "react";
import { Container, Section } from "@/components/container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { kitCatalog } from "./content";
import { SectionHeading } from "./section-heading";

const steps = [
  { command: "pnpm install", note: "Install everything (once)." },
  {
    command: "pnpm start-project",
    note: "Name it, pick a kit or two, pick a look.",
  },
  { command: "pnpm dev", note: "Open http://localhost:3000." },
  { command: "claude", note: "Start Claude Code and type /start." },
];

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
      {children}
    </code>
  );
}

export function GetStarted() {
  return (
    <Section id="get-started" className="scroll-mt-24">
      <Container className="flex flex-col gap-12">
        <SectionHeading
          eyebrow="Get started"
          title="Four commands to a running app."
        >
          Run these in the project folder. The wizard can be re-run any time.
        </SectionHeading>

        <ol className="grid gap-stack sm:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, i) => (
            <li
              key={step.command}
              className="surface flex flex-col gap-3 rounded-card p-card"
            >
              <span className="font-mono text-xs text-primary-text">
                Step {i + 1}
              </span>
              <code className="font-mono text-base font-semibold break-words">
                {step.command}
              </code>
              <p className="text-sm text-muted-foreground">{step.note}</p>
            </li>
          ))}
        </ol>

        <div className="grid gap-stack lg:grid-cols-3">
          <Card>
            <CardHeader>
              <BlocksIcon
                className="mb-2 size-6 text-primary-text"
                aria-hidden
              />
              <CardTitle>Add a kit</CardTitle>
              <CardDescription>
                Kits live in <Code>kits/</Code> and are not part of the app
                until you add one. One or two is plenty.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <pre className="overflow-x-auto rounded-control bg-muted p-3 font-mono text-sm">
                pnpm kit list{"\n"}pnpm kit add map
              </pre>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                {kitCatalog.map((kit) => (
                  <li key={kit.name} className="flex items-center gap-2">
                    <kit.icon
                      className="size-4 shrink-0 text-primary-text"
                      aria-hidden
                    />
                    <span className="font-mono">{kit.name}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <PaletteIcon
                className="mb-2 size-6 text-primary-text"
                aria-hidden
              />
              <CardTitle>Change the look</CardTitle>
              <CardDescription>
                In development, the <strong>Design</strong> button (bottom
                right) flips every axis live. Like it? Press{" "}
                <strong>Copy config</strong> and paste into{" "}
                <Code>design.config.ts</Code>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Presets: summit, brutalist, soft, editorial, terminal, bento. Or
                ask Claude: <Code>/design make it brutalist</Code>.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TerminalSquareIcon
                className="mb-2 size-6 text-primary-text"
                aria-hidden
              />
              <CardTitle>Build with Claude Code</CardTitle>
              <CardDescription>
                Run <Code>claude</Code> in this folder. <Code>/start</Code>{" "}
                picks a kit and design with you; <Code>/setup</Code> connects
                your own Supabase and Vercel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Then just ask: “add a page that lists our team’s projects”.
                Check its work with <Code>pnpm verify</Code>.
              </p>
            </CardContent>
          </Card>
        </div>
      </Container>
    </Section>
  );
}
