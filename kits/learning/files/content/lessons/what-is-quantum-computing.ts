import type { Lesson } from "@/lib/learning/types";

export const whatIsQuantumComputing: Lesson = {
  slug: "what-is-quantum-computing",
  title: "What is a quantum computer?",
  summary:
    "Bits, qubits and why a quantum computer is a different kind of tool, not just a faster laptop.",
  minutes: 4,
  sections: [
    {
      heading: "Start with the computer you already have",
      paragraphs: [
        "Your phone and laptop work with bits. A bit is a tiny switch that is either 0 or 1. Every photo, message and app is built from billions of them.",
        "Ordinary computers are extremely good at most tasks, and they will keep doing almost everything you use day to day.",
      ],
    },
    {
      heading: "Qubits",
      paragraphs: [
        "A quantum computer uses qubits. Before you look at it, a qubit can be in a superposition: a blend of 0 and 1, described by numbers that set how likely each result is.",
        "When you measure a qubit you always get a plain 0 or 1. You'll often hear that a qubit is \"0 and 1 at the same time\". That's a handy shorthand, but it hides the important part: the maths of how those possibilities combine.",
      ],
    },
    {
      heading: "Where the advantage comes from",
      paragraphs: [
        "A quantum computer does not simply try every answer at once and print the best one. Quantum algorithms are designed so that the possibilities leading to wrong answers cancel each other out (interference), while the ones leading to right answers add up.",
        "Qubits can also be entangled, which links their results together. Interference and entanglement only give a big speed-up for certain kinds of problems.",
      ],
    },
    {
      heading: "Where things stand today",
      paragraphs: [
        "Today's quantum computers are small and make lots of errors, because qubits are easily disturbed by heat, vibration and other noise.",
        "A major goal is error correction: combining many physical qubits to make one reliable qubit. Useful, large-scale machines are still being built.",
      ],
      points: [
        "Bits are 0 or 1; qubits can be in a superposition until measured.",
        "Speed-ups come from interference, and only for specific problems.",
        "Current machines are early and error-prone.",
      ],
    },
  ],
  quiz: [
    {
      id: "measure",
      question: "What do you get when you measure a qubit?",
      options: [
        "A plain 0 or 1",
        "A number somewhere between 0 and 1",
        "0 and 1 at the same time",
        "Nothing until the computer is switched off",
      ],
      answer: 0,
      explanation:
        "Measuring always gives a plain 0 or 1. The superposition decides how likely each result is, not what you read out.",
    },
    {
      id: "advantage",
      question: "Which is the best description of how quantum algorithms help?",
      options: [
        "They try every possible answer at once and print the best one",
        "They use interference so possibilities leading to wrong answers tend to cancel out",
        "They run at a much higher clock speed than normal chips",
        "They store far more files than a normal hard drive",
      ],
      answer: 1,
      explanation:
        'Interference is the key idea. "Trying every answer at once" is a common myth: you only get one measurement result, so the algorithm has to steer the odds toward the right answer.',
    },
    {
      id: "everyday",
      question:
        "Will quantum computers make everyday apps and web browsing faster?",
      options: [
        "Yes, all software will run faster",
        "No, they help with specific kinds of problems, not everyday tasks",
        "Only once everyone has a quantum phone",
      ],
      answer: 1,
      explanation:
        "Quantum computers are specialised tools. Ordinary computers stay the best choice for almost everything people do day to day.",
    },
  ],
};
