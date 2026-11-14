/**
 * The shape of a lesson. Every file in content/lessons/ exports one `Lesson`.
 * TypeScript checks your lesson against this, so a typo shows up as a red underline.
 */

export type LessonSection = {
  heading: string;
  /** Paragraphs, in order. Each string is one paragraph. */
  paragraphs: string[];
  /** Optional bullet points shown after the paragraphs. */
  points?: string[];
};

export type QuizQuestion = {
  /** Short and unique within the lesson, for example "q1". */
  id: string;
  question: string;
  /** Two to five answers. */
  options: string[];
  /** Which option is right, counting from 0 (the first option is 0). */
  answer: number;
  /** Shown after answering, right or wrong. Explain *why*, in a sentence or two. */
  explanation: string;
};

export type Lesson = {
  /** The URL: /learn/<slug>. Lowercase words joined by dashes. */
  slug: string;
  title: string;
  /** One or two sentences, shown on the lesson list. */
  summary: string;
  /** Roughly how long it takes to read, in minutes. */
  minutes: number;
  sections: LessonSection[];
  quiz: QuizQuestion[];
};
