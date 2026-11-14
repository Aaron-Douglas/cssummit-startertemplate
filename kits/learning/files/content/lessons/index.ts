import type { Lesson } from "@/lib/learning/types";
import { quantumAndYourNeighbourhood } from "./quantum-and-your-neighbourhood";
import { whatIsQuantumComputing } from "./what-is-quantum-computing";
import { whatQuantumIsGoodFor } from "./what-quantum-is-good-for";

/**
 * Every lesson on /learn, in the order they are shown. To add one:
 *   1. Copy a lesson file in this folder and rename it (for example my-topic.ts).
 *   2. Change the export name, slug, title, summary, sections and quiz.
 *   3. Import it below and add it to the list where you want it to appear.
 */
export const lessons: Lesson[] = [
  whatIsQuantumComputing,
  whatQuantumIsGoodFor,
  quantumAndYourNeighbourhood,
];
