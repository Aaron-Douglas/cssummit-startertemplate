# Definition of done

A task is done when you have evidence, not when the code looks right.

1. `pnpm verify` passes (Biome, typecheck, production build). Read the output; do not assume.
2. For UI changes, the page renders in the browser at desktop width and at ~375px, with no console errors. Check `/styleguide` if you touched tokens or `components/ui/`.
3. Styling uses semantic tokens only. No hardcoded colours or radii.
4. New env vars are read through `lib/env.ts` and listed in `.env.example`. No secret values in any committed file.
5. The app still runs with no env vars set (demo mode for `app` and `chatbot`).
6. Your report says what you ran, what you saw, and anything you could not check.

If `pnpm verify` fails, fix the cause. Do not disable a lint rule, add `// @ts-ignore`, or delete a check to make it pass without telling the learner why.
