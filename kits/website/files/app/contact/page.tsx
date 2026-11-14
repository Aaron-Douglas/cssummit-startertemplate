import { ClockIcon, MailIcon, MapPinIcon } from "lucide-react";
import type { Metadata } from "next";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ContactForm } from "@/components/website/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions, ideas or feedback? Send us a message.",
};

// Edit these to match your team. Leave a line out rather than inventing details.
const details = [
  {
    icon: MailIcon,
    label: "Reply time",
    text: "We read every message and reply by email.",
  },
  { icon: MapPinIcon, label: "Where", text: "Built in Chicago." },
  {
    icon: ClockIcon,
    label: "During the hackathon",
    text: "Expect a reply within a day.",
  },
];

export default function ContactPage() {
  return (
    <Container className="flex flex-col gap-10 py-section">
      <PageHeader
        eyebrow="Contact"
        title="Say hello"
        description="Questions, ideas or feedback on what we're building? Send us a message."
      />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card>
          <CardContent>
            <ContactForm />
          </CardContent>
        </Card>
        <ul className="flex flex-col gap-stack">
          {details.map(({ icon: Icon, label, text }) => (
            <li key={label} className="flex gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-primary-tint text-primary-text">
                <Icon className="size-5" aria-hidden />
              </span>
              <div className="flex flex-col gap-1">
                <p className="font-medium">{label}</p>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Container>
  );
}
