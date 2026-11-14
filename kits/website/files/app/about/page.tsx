import { ArrowRightIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container, Section } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Faq, type FaqItem } from "@/components/website/faq";
import { TeamGrid, type TeamMember } from "@/components/website/team-grid";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why we're building this, who we are, and answers to common questions.",
};

/* ─── Edit this page's content here ────────────────────────────────────────────────────────── */

const mission = {
  title: "Why we're building this",
  description:
    "One or two sentences on the problem and who it's for. Say it the way you'd explain it to a neighbour.",
  points: [
    {
      title: "The problem",
      text: "What's hard today, and for whom? Use something you heard from a real person.",
    },
    {
      title: "Our idea",
      text: "What you built, in one sentence. Name the one thing it does well.",
    },
    {
      title: "Why it matters",
      text: "What changes for people if it works. Keep it specific and honest.",
    },
  ],
};

// Placeholders. Swap in your team (initials are shown instead of photos).
const team: TeamMember[] = [
  { initials: "T1", name: "Teammate one", role: "Product & research" },
  { initials: "T2", name: "Teammate two", role: "Design" },
  { initials: "T3", name: "Teammate three", role: "Front end" },
  { initials: "T4", name: "Teammate four", role: "Data & back end" },
];

const faq: FaqItem[] = [
  {
    question: "Who is this for?",
    answer:
      "Describe the people you designed for. Being specific (a neighbourhood, an age group, a situation) makes the project stronger.",
  },
  {
    question: "Is it free?",
    answer:
      "Say whether it costs anything, and whether you collect any personal information.",
  },
  {
    question: "Where does the information come from?",
    answer:
      "Name your data sources and how often they're updated, so people know what to trust.",
  },
  {
    question: "How can I help or give feedback?",
    answer:
      "Point people to the contact page. Feedback from real users is the best thing you can show judges.",
  },
];

/* ──────────────────────────────────────────────────────────────────────────────────────────── */

export default function AboutPage() {
  return (
    <Container className="flex flex-col py-section">
      <PageHeader
        eyebrow="About"
        title={mission.title}
        description={mission.description}
      />

      <Section aria-labelledby="mission-heading" className="pt-10">
        <h2 id="mission-heading" className="sr-only">
          Our mission
        </h2>
        <ol className="grid gap-stack md:grid-cols-3">
          {mission.points.map((point, index) => (
            <li
              key={point.title}
              className="surface flex flex-col gap-3 rounded-card p-card"
            >
              <span className="font-mono text-sm text-primary-text">
                0{index + 1}
              </span>
              <h3 className="text-xl">{point.title}</h3>
              <p className="text-muted-foreground">{point.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        aria-labelledby="team-heading"
        className="flex flex-col gap-8 border-t"
      >
        <div className="flex flex-col gap-3">
          <p className="eyebrow">Team</p>
          <h2 id="team-heading" className="text-3xl sm:text-4xl">
            Who we are
          </h2>
        </div>
        <TeamGrid members={team} />
      </Section>

      <Section
        aria-labelledby="faq-heading"
        className="flex flex-col gap-8 border-t"
      >
        <div className="flex flex-col gap-3">
          <p className="eyebrow">FAQ</p>
          <h2 id="faq-heading" className="text-3xl sm:text-4xl">
            Questions people ask
          </h2>
        </div>
        <Faq items={faq} />
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-muted-foreground">Still have a question?</p>
          <Button asChild variant="outline">
            <Link href="/contact">
              Contact us
              <ArrowRightIcon />
            </Link>
          </Button>
        </div>
      </Section>
    </Container>
  );
}
