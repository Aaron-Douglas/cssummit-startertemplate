import type { Update } from "@/lib/website/updates";

export const firstPrototype: Update = {
  slug: "first-prototype",
  title: "Our first prototype is live",
  date: "2026-11-13",
  tag: "Build log",
  summary:
    "A working link, a short demo and a list of what we'd do next. Try it and tell us what breaks.",
  body: [
    "It's rough, but it works and it's on a real URL. That was our goal for the end of day one.",
    { heading: "What works" },
    {
      list: [
        "The main page loads fast on a phone",
        "The contact form reaches us",
        "It follows our chosen design across every page",
      ],
    },
    { heading: "What's next" },
    "Testing with three people who didn't build it, fixing whatever confuses them, and practising a two-minute demo.",
  ],
};
