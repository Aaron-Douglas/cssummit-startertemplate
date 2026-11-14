import { STARTER_PROMPTS } from "./system-prompt";

/**
 * Demo mode: canned replies used when ANTHROPIC_API_KEY is not set, so the /chat page works
 * before your team has a key. They are streamed the same way real replies are. Nothing here
 * calls Claude, and every reply says it is a demo.
 */

const PREFIX = "[Demo reply, not from Claude]\n\n";

const GENERIC = `${PREFIX}Storm Watch is in demo mode, so this is a pre-written answer and I can't read the weather for you yet. I won't guess at numbers.

For the current conditions, open the Map page: it shows every neighborhood's temperature, wind and rain.

To get real answers from Claude:
1. Create an API key on your team's own Anthropic account.
2. Add it to .env.local as ANTHROPIC_API_KEY=your-key.
3. Restart pnpm dev and send your message again.

The steps are in kits/chatbot/README.md.`;

// These match STARTER_PROMPTS in system-prompt.ts. If you change the prompts, unmatched
// questions get the generic reply above, which is fine. They describe what a real answer would
// do and never quote weather numbers, because a demo reply cannot know today's weather.
const STARTER_REPLIES = [
  `${PREFIX}In demo mode I can't see Pilsen's weather, so I won't guess.

With a real API key, Storm Watch reads Pilsen's latest reading and answers straight: "Yes, bring an umbrella" if it is raining or showering there, "No" if it is dry, with the time of the reading.

For now, open the Map page and tap Pilsen to see its current conditions.`,
  `${PREFIX}In demo mode I can't compare today's temperatures, so I won't make one up.

With a real API key, Storm Watch looks at the current reading for all eight neighborhoods and names the warmest one, with its temperature and the time of the reading.

For now, the Map page lists every neighborhood with its temperature.`,
  `${PREFIX}In demo mode I can't check the wind or rain along that route, so I won't guess.

With a real API key, Storm Watch checks the current readings for Hyde Park and the Loop (rain, wind, temperature) and tells you whether it looks like a good ride, with the time of the reading. For thunderstorms or other severe weather it points you to weather.gov/lot.

For now, tap Hyde Park and the Loop on the Map page.`,
];

export function demoReplyFor(question: string): string {
  const index = STARTER_PROMPTS.findIndex(
    (prompt) => prompt.trim().toLowerCase() === question.trim().toLowerCase(),
  );
  return STARTER_REPLIES[index] ?? GENERIC;
}

/** Splits a reply into small pieces and yields them with a short pause, like a real stream. */
export async function* streamDemoReply(
  reply: string,
  signal: AbortSignal,
): AsyncGenerator<string> {
  const pieces = reply.match(/\S+\s*/g) ?? [reply];
  for (const piece of pieces) {
    if (signal.aborted) return;
    await new Promise((resolve) => setTimeout(resolve, 35));
    yield piece;
  }
}
