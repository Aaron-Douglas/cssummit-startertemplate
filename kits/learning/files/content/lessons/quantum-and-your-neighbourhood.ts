import type { Lesson } from "@/lib/learning/types";

export const quantumAndYourNeighbourhood: Lesson = {
  slug: "quantum-and-your-neighbourhood",
  title: "What could quantum mean for a neighbourhood?",
  summary:
    "Chicago is investing in quantum technology. Here's what that could mean for jobs and land, and the questions worth asking.",
  minutes: 5,
  sections: [
    {
      heading: "Chicago is a quantum hub",
      paragraphs: [
        "The Chicago Quantum Exchange, started in 2017 and based at the University of Chicago, connects universities, national laboratories such as Argonne and Fermilab, and companies working on quantum technology.",
        "In 2024 the State of Illinois announced the Illinois Quantum and Microelectronics Park, planned for the former U.S. Steel South Works site on the city's Southeast Side, with the company PsiQuantum named as its first major tenant. Plans and timelines for projects like this can change, so check recent news before you rely on a detail.",
      ],
    },
    {
      heading: "The jobs aren't only for physicists",
      paragraphs: [
        "A quantum research campus needs far more than scientists. Building and running one involves construction and the trades, electricians, technicians who maintain equipment, software developers, IT and cybersecurity staff, and people in operations, facilities and administration.",
        "Some of these roles need a university degree. Many need a certificate, an apprenticeship or a two-year programme instead.",
      ],
    },
    {
      heading: "Questions a neighbour can ask",
      paragraphs: [
        "Big projects bring change. Whether the change helps the people who already live nearby depends a lot on what is agreed and written down. Useful questions include:",
      ],
      points: [
        "How many jobs, of what kinds, and when? Is there a local hiring commitment?",
        "Which training programmes lead to those jobs, and are they open to residents?",
        "What happens to the land, traffic and the local environment?",
        "Is there a community benefits agreement, and who is checking it's kept?",
        "How can residents give input, and where are meetings announced?",
      ],
    },
    {
      heading: "Hype or hope?",
      paragraphs: [
        "A big announcement is a starting point, not a result. Quantum technology is still early, and benefits for a neighbourhood depend on choices made by companies, governments and residents over many years.",
      ],
    },
  ],
  quiz: [
    {
      id: "jobs",
      question: "Which kinds of jobs does a quantum technology campus need?",
      options: [
        "Only physicists with a PhD",
        "A mix, including trades, technicians, software, IT and operations",
        "None, because quantum computers build themselves",
      ],
      answer: 1,
      explanation:
        "Research needs scientists, but building, running and securing a campus needs many other skills, several of which don't require a university degree.",
    },
    {
      id: "cba",
      question: "What is a community benefits agreement?",
      options: [
        "A written deal between a developer and community groups, with commitments such as local hiring",
        "A discount card for local shops",
        "A government rule that bans new buildings",
      ],
      answer: 0,
      explanation:
        "A community benefits agreement puts promises in writing (for example jobs, training or local investment) so residents can hold a project to them.",
    },
    {
      id: "headline",
      question:
        'A headline says a new quantum campus will "transform the neighbourhood overnight". What is the most useful response?',
      options: [
        "Believe it: it's in the news",
        "Ignore it completely: nothing will change",
        "Ask specific questions: which jobs, for whom, when, and what is in writing",
      ],
      answer: 2,
      explanation:
        "Neither hype nor dismissal helps. Specific questions about jobs, timelines and written commitments show what will really change.",
    },
  ],
};
