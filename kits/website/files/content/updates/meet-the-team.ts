import type { Update } from "@/lib/website/updates";

export const meetTheTeam: Update = {
  slug: "meet-the-team",
  title: "Hello! Here's who we are",
  date: "2026-11-07",
  tag: "Team",
  summary:
    "Four people, one weekend, one problem we care about. A quick introduction and why we picked this idea.",
  body: [
    "We're a team of four students building a prototype at the Black CS Success Summit hackathon. Between us we have a designer, two developers and someone who has talked to more neighbours this month than all of us combined.",
    { heading: "Why this problem" },
    "Replace this paragraph with the story behind your idea. Who did you talk to? What did they tell you that surprised you? Judges remember stories, so tell yours plainly.",
    { heading: "What we're building first" },
    {
      list: [
        "One page that does one useful thing well",
        "A way for people to tell us what's missing",
        "Nothing that needs a login on day one",
      ],
    },
  ],
};
