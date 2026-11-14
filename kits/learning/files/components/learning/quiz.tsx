"use client";

import { CheckIcon, RotateCcwIcon, TrophyIcon, XIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { saveQuizResult, useProgress } from "@/lib/learning/progress";
import type { QuizQuestion } from "@/lib/learning/types";
import { cn } from "@/lib/utils";

type Mode = "one" | "all";

/**
 * A quiz with instant feedback. Each question is a native radio group (arrow keys move between
 * answers), feedback is announced to screen readers, and the score is saved to this browser.
 *
 *   <Quiz slug="my-lesson" questions={lesson.quiz} />
 */
export function Quiz({
  slug,
  questions,
  defaultMode = "one",
}: {
  slug: string;
  questions: QuizQuestion[];
  defaultMode?: Mode;
}) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [current, setCurrent] = useState(0);
  // Bumped on retry so the radio inputs remount empty.
  const [attempt, setAttempt] = useState(0);
  const [focusTarget, setFocusTarget] = useState<string | null>(null);
  const progress = useProgress();
  const best = progress?.[slug];
  const rootRef = useRef<HTMLDivElement>(null);

  const total = questions.length;
  const answeredCount = questions.filter((q) => checked[q.id]).length;
  const finished = total > 0 && answeredCount === total;
  const score = questions.filter(
    (q) => checked[q.id] && selected[q.id] === q.answer,
  ).length;

  // Move keyboard focus after something changes (feedback, next question, score, retry).
  useEffect(() => {
    if (!focusTarget) return;
    const element = rootRef.current?.querySelector<HTMLElement>(
      `[data-focus="${focusTarget}"]`,
    );
    element?.focus();
    setFocusTarget(null);
  }, [focusTarget]);

  function check(question: QuizQuestion, index: number) {
    const nextChecked = { ...checked, [question.id]: true };
    setChecked(nextChecked);
    const done = questions.every((q) => nextChecked[q.id]);
    if (done) {
      const finalScore = questions.filter(
        (q) => selected[q.id] === q.answer,
      ).length;
      saveQuizResult(slug, finalScore, total);
    }
    setFocusTarget(
      mode === "one" ? `next-${index}` : `feedback-${question.id}`,
    );
  }

  function goNext(index: number) {
    if (index + 1 < total) {
      setCurrent(index + 1);
      setFocusTarget(`legend-${index + 1}`);
    } else {
      setFocusTarget("score");
    }
  }

  function retry() {
    setSelected({});
    setChecked({});
    setCurrent(0);
    setAttempt((value) => value + 1);
    setFocusTarget("legend-0");
  }

  function switchMode(next: Mode) {
    setMode(next);
    if (next === "one") {
      // Continue from the first question that hasn't been checked yet.
      const firstOpen = questions.findIndex((q) => !checked[q.id]);
      setCurrent(firstOpen === -1 ? total - 1 : firstOpen);
    }
  }

  if (total === 0) return null;

  const showScore = finished && (mode === "all" || current === total - 1);
  const visible =
    mode === "all"
      ? questions.map((question, index) => ({ question, index }))
      : [{ question: questions[current], index: current }];

  return (
    <div ref={rootRef} className="flex flex-col gap-stack">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted-foreground">
            {answeredCount} of {total} answered
          </p>
          {best ? (
            <Badge variant="tint">
              Best: {best.bestScore}/{best.total}
            </Badge>
          ) : null}
        </div>
        {/* biome-ignore lint/a11y/useSemanticElements: a toolbar of toggle buttons, not a form group */}
        <div
          role="group"
          aria-label="How to show questions"
          className="flex gap-1 rounded-control border p-1"
        >
          {(
            [
              ["one", "One at a time"],
              ["all", "All at once"],
            ] as const
          ).map(([value, label]) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={mode === value ? "secondary" : "ghost"}
              aria-pressed={mode === value}
              onClick={() => switchMode(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {mode === "one" ? (
        <div
          className="h-1.5 overflow-hidden rounded-badge bg-muted"
          aria-hidden
        >
          <div
            className="h-full rounded-badge bg-primary transition-[width] motion-reduce:transition-none"
            style={{ width: `${(answeredCount / total) * 100}%` }}
          />
        </div>
      ) : null}

      {visible.map(({ question, index }) => (
        <QuestionCard
          key={`${attempt}-${question.id}`}
          question={question}
          index={index}
          total={total}
          mode={mode}
          selected={selected[question.id]}
          checked={Boolean(checked[question.id])}
          onSelect={(option) =>
            setSelected((value) => ({ ...value, [question.id]: option }))
          }
          onCheck={() => check(question, index)}
          onNext={() => goNext(index)}
        />
      ))}

      {showScore ? (
        <section
          aria-labelledby={`score-${slug}`}
          className="flex flex-col items-start gap-4 rounded-card border border-primary/40 bg-primary-tint p-card"
        >
          <div className="flex items-center gap-3">
            <TrophyIcon className="size-6 text-primary-text" aria-hidden />
            <h3
              id={`score-${slug}`}
              data-focus="score"
              tabIndex={-1}
              className="text-2xl outline-none"
            >
              You scored {score} out of {total}
            </h3>
          </div>
          <p className="text-muted-foreground">
            {score === total
              ? "Perfect! Your progress is saved on this device."
              : "Nice work. Read the explanations, then try again to beat your score."}
          </p>
          <Button type="button" variant="outline" onClick={retry}>
            <RotateCcwIcon />
            Try again
          </Button>
        </section>
      ) : null}
    </div>
  );
}

function QuestionCard({
  question,
  index,
  total,
  mode,
  selected,
  checked,
  onSelect,
  onCheck,
  onNext,
}: {
  question: QuizQuestion;
  index: number;
  total: number;
  mode: Mode;
  selected: number | undefined;
  checked: boolean;
  onSelect: (option: number) => void;
  onCheck: () => void;
  onNext: () => void;
}) {
  const id = useId();
  const [hint, setHint] = useState(false);
  const correct = selected === question.answer;
  const isLast = index === total - 1;

  return (
    <fieldset className="surface flex min-w-0 flex-col gap-4 rounded-card p-card">
      <legend
        data-focus={`legend-${index}`}
        tabIndex={-1}
        className="float-left mb-1 w-full outline-none"
      >
        <span className="block font-mono text-xs tracking-wide text-muted-foreground uppercase">
          Question {index + 1} of {total}
        </span>
        <span className="mt-2 block font-heading text-lg font-semibold text-pretty">
          {question.question}
        </span>
      </legend>

      <div className="clear-both flex flex-col gap-2">
        {question.options.map((option, optionIndex) => {
          const isChosen = selected === optionIndex;
          const isAnswer = optionIndex === question.answer;
          return (
            <label
              key={option}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-field border p-3 text-sm transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50 sm:text-base",
                !checked && "hover:border-primary has-checked:border-primary",
                checked && "cursor-default",
                checked && isAnswer && "border-success bg-success/10",
                checked &&
                  isChosen &&
                  !isAnswer &&
                  "border-destructive bg-destructive/10",
              )}
            >
              <input
                type="radio"
                name={`${id}-answer`}
                value={optionIndex}
                checked={isChosen}
                disabled={checked}
                onChange={() => {
                  onSelect(optionIndex);
                  setHint(false);
                }}
                className="mt-0.5 size-4 shrink-0 accent-primary"
              />
              <span className="flex-1">{option}</span>
              {checked && isAnswer ? (
                <span className="flex items-center gap-1 text-success">
                  <CheckIcon className="size-4" aria-hidden />
                  <span className="sr-only">(correct answer)</span>
                </span>
              ) : null}
              {checked && isChosen && !isAnswer ? (
                <span className="flex items-center gap-1 text-destructive">
                  <XIcon className="size-4" aria-hidden />
                  <span className="sr-only">(your answer)</span>
                </span>
              ) : null}
            </label>
          );
        })}
      </div>

      {/* Always in the page so screen readers announce what appears inside it. */}
      <div
        aria-live="polite"
        data-focus={`feedback-${question.id}`}
        tabIndex={-1}
        className="outline-none"
      >
        {checked ? (
          <div
            className={cn(
              "flex flex-col gap-1 rounded-field border p-3 text-sm sm:text-base",
              correct
                ? "border-success/40 bg-success/10"
                : "border-destructive/40 bg-destructive/10",
            )}
          >
            <p
              className={cn(
                "font-semibold",
                correct ? "text-success" : "text-destructive",
              )}
            >
              {correct
                ? "Correct!"
                : `Not quite. The answer is: ${question.options[question.answer]}`}
            </p>
            <p className="text-foreground">{question.explanation}</p>
          </div>
        ) : hint ? (
          <p className="text-sm text-muted-foreground">Pick an answer first.</p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        {!checked ? (
          <Button
            type="button"
            onClick={() => {
              if (selected === undefined) setHint(true);
              else onCheck();
            }}
          >
            Check answer
          </Button>
        ) : mode === "one" ? (
          <Button type="button" data-focus={`next-${index}`} onClick={onNext}>
            {isLast ? "See your score" : "Next question"}
          </Button>
        ) : null}
      </div>
    </fieldset>
  );
}
