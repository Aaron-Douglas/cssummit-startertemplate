# Learning kit

Short lessons with a quiz at the end, and progress saved in the browser. No accounts, no keys.

```bash
pnpm kit add learning
```

| Route | What it shows |
|---|---|
| `/learn` | Every lesson, with a progress bar, a "Done · 3/3" badge per lesson and a reset button |
| `/learn/<slug>` | The lesson's sections, then its quiz |

A "Learn" nav link is added for you. The kit ships three sample lessons on what quantum
computing could mean for a Chicago neighbourhood. Replace them with your own topic.

## Write a lesson

1. Copy `content/lessons/what-is-quantum-computing.ts` to a new file, for example
   `content/lessons/bus-routes.ts`.
2. Rename the export (`export const busRoutes`), then change:
   - `slug`: the URL (`/learn/bus-routes`). Lowercase, dashes, unique.
   - `title`, `summary`, `minutes`.
   - `sections`: each has a `heading`, a list of `paragraphs` and optional `points` (bullets).
   - `quiz`: each question has an `id`, the `question`, two to five `options`, the `answer`
     (counting from 0, so the first option is `0`) and an `explanation` shown after answering.
3. Import it in `content/lessons/index.ts` and put it in the `lessons` list where it should
   appear.

TypeScript checks every lesson against `lib/learning/types.ts`, so a missing field shows up
as a red underline and in `pnpm verify`.

## The quiz

`components/learning/quiz.tsx`. Learners pick "One at a time" or "All at once". Each answer gets
instant feedback with the explanation, then a score and a "Try again" button. Each question is a
native radio group (arrow keys move between answers), feedback is announced to screen readers
and focus moves sensibly, so it works with a keyboard alone. Start in "all at once" mode with
`<Quiz defaultMode="all" ... />`.

## Progress

`lib/learning/progress.ts` saves the best score per lesson in `localStorage` (this browser on
this device only). It loads after the page appears, so the server HTML and the first render
match. To sync across devices, swap its `read`/`write` for your database (for example the
`app` kit's Supabase).

## Files

```
app/learn/page.tsx                app/learn/[slug]/page.tsx
components/learning/              quiz, progress-status
lib/learning/                     types, lessons, progress
content/lessons/                  one file per lesson + index.ts
```
