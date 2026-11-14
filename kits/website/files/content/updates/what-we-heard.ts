import type { Update } from "@/lib/website/updates";

export const whatWeHeard: Update = {
  slug: "what-we-heard",
  title: "What we heard from the neighbourhood",
  date: "2026-11-10",
  tag: "Research",
  summary:
    "We asked people what gets in their way. Three answers came up again and again, and they changed our plan.",
  body: [
    "Before writing code we spent an afternoon asking people one question: what's the most annoying part of getting the help you need around here?",
    { heading: "Three things we kept hearing" },
    {
      list: [
        "Information is spread across too many places",
        "Hours and details are out of date",
        "Most sites are hard to use on a phone",
      ],
    },
    "So we're designing for a phone first, keeping the information in one place, and showing when each detail was last checked.",
    "Swap these sample notes for your own. Even five short conversations are enough to show judges you built for real people.",
  ],
};
