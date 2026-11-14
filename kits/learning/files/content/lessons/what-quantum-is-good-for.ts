import type { Lesson } from "@/lib/learning/types";

export const whatQuantumIsGoodFor: Lesson = {
  slug: "what-quantum-is-good-for",
  title: "What could quantum computers be good for?",
  summary:
    "Chemistry, materials and encryption: where quantum computers are expected to matter, and how to spot hype.",
  minutes: 4,
  sections: [
    {
      heading: "Simulating nature",
      paragraphs: [
        "Molecules and materials follow the rules of quantum physics. Simulating them exactly on an ordinary computer gets very hard, very fast, as they get bigger.",
        "A large, reliable quantum computer could help researchers study things like new battery materials, more efficient ways to make fertiliser, or how a medicine binds in the body. This is one of the most widely expected uses, and it is still mostly research today.",
      ],
    },
    {
      heading: "Encryption: a risk and a fix",
      paragraphs: [
        "Much of the internet's security uses public-key encryption (for example RSA). A large, error-corrected quantum computer running Shor's algorithm could break some of these methods. No quantum computer today can do this.",
        "Because data stolen now could be decrypted later, organisations are already switching to post-quantum cryptography: new methods designed to resist quantum attacks. In 2024 the U.S. National Institute of Standards and Technology (NIST) published its first standards for it.",
      ],
    },
    {
      heading: "A quick hype check",
      paragraphs: [
        "You'll see claims that quantum computers will solve traffic, finance or climate change. For most everyday business problems there is no proven quantum advantage yet.",
      ],
      points: [
        "Ask which specific problem is being solved.",
        "Ask whether it beats the best ordinary computer, not just an old one.",
        "Ask whether it works today or is expected in the future.",
      ],
    },
  ],
  quiz: [
    {
      id: "chemistry",
      question:
        "Why are quantum computers expected to help with chemistry and materials?",
      options: [
        "Molecules follow quantum physics, which ordinary computers find hard to simulate exactly",
        "Quantum computers can see individual atoms",
        "Chemistry software is too old to run on laptops",
      ],
      answer: 0,
      explanation:
        "Nature is quantum, so a quantum computer is a natural fit for simulating it. That's why chemistry and materials come up so often.",
    },
    {
      id: "pqc",
      question: "What is post-quantum cryptography?",
      options: [
        "Encryption that only runs on quantum computers",
        "Encryption designed to stay secure even against future quantum computers",
        "A way to delete old passwords automatically",
        "The name of a quantum computer made in 2024",
      ],
      answer: 1,
      explanation:
        "Post-quantum cryptography runs on ordinary computers but uses maths problems that quantum computers aren't expected to crack. NIST published standards in 2024.",
    },
    {
      id: "banking",
      question:
        "Can today's quantum computers break the encryption that protects online banking?",
      options: [
        "Yes, it happens regularly",
        "No, that would need a much larger, error-corrected machine than exists today",
        "Only on weekends when traffic is low",
      ],
      answer: 1,
      explanation:
        "Today's machines are far too small and noisy. The concern is about future machines, which is why the switch to new encryption is starting now.",
    },
  ],
};
