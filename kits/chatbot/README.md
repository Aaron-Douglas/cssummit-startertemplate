# Chatbot kit

A `/chat` page where people talk to Claude. Replies stream in word by word, with a Stop button,
a Clear button, a few starter questions, and clear error messages. The conversation lives in
the browser tab only: nothing is saved, and refreshing the page starts over.

```bash
pnpm kit add chatbot
pnpm dev            # open http://localhost:3000/chat
```

## What it adds

| File | What it is |
|---|---|
| `lib/chatbot/system-prompt.ts` | **Edit this one.** The bot's name, description, starter questions and instructions. |
| `app/chat/page.tsx` | The `/chat` page. |
| `components/chatbot/chat.tsx` | The chat UI (messages, input, streaming, stop, clear). |
| `app/api/chat/route.ts` | The server route that calls Claude. The API key is only used here. |
| `lib/chatbot/schema.ts` | Size limits on messages, and the request check. |
| `lib/chatbot/demo.ts` | The canned replies used in demo mode. |

## Demo mode

With no `ANTHROPIC_API_KEY`, the page still works: it streams **pre-written** replies, marks each
one "Demo", and shows a notice. Demo replies are not real answers. Do not present them to judges
as your bot's output.

## Get your own API key

Use **your team's own** Anthropic account. Never use a key from the organisers, an employer, or
anything you find on a computer.

1. Sign in or sign up at [platform.claude.com](https://platform.claude.com) (one teammate is
   enough; invite the others to the organisation).
2. Add credit under **Billing**. The API is paid per use and is separate from a Claude.ai
   subscription.
3. Go to **API keys**, create a key, and copy it. You only see it once.
4. In the project folder, create `.env.local` (it is git-ignored) and add:

   ```bash
   ANTHROPIC_API_KEY=paste-your-key-here
   # Optional: a different model. Empty uses claude-opus-5-5.
   ANTHROPIC_MODEL=
   ```

5. Stop `pnpm dev` (Ctrl+C) and start it again. The demo notice disappears.

If you are using an AI coding assistant, paste the key into `.env.local` yourself. Do not paste it
into the chat.

## Cost: know what you are spending

You pay for every message: the text sent in (system prompt + recent conversation) and the reply
that comes back. Prices are per million tokens (a token is about 4 characters of English);
check current prices at [claude.com/pricing](https://claude.com/pricing).

The kit keeps costs low by default:

- Each reply is capped at 4,096 tokens (`MAX_TOKENS` in `app/api/chat/route.ts`).
- Each request sends at most 30 messages and about 48,000 characters
  (`CHAT_LIMITS` in `lib/chatbot/schema.ts`). Older messages are dropped.
- Effort is set to `low`, which suits chat and answers faster.

A typical question and answer costs around a cent or two on the default model. A cheaper model
(set `ANTHROPIC_MODEL`) costs less per message; try it and check the answers are still good.

**Set a spend limit** in the Anthropic Console (**Limits**) before you share your link. Once your
site is public, anyone who finds `/chat` can send messages on your credit.

## Never commit the key

- The key lives in `.env.local` (git-ignored) and in your Vercel project settings. Nowhere else.
- `.env.example` lists the variable **name** only. Leave its value empty.
- Before every commit, check `git diff --staged` for anything that looks like a key.
- If a key is ever committed or shared, delete it in the Console straight away and create a new
  one. Removing it from the code is not enough: it stays in git history.

The key is read only on the server (`app/api/chat/route.ts`, through `lib/env.ts`). The browser
never receives it.

## Put it on your Vercel project

On your **own** Vercel project: **Settings → Environment Variables**, add `ANTHROPIC_API_KEY`
(and `ANTHROPIC_MODEL` if you set one) for Production and Preview, then redeploy. Open
`/chat` on your deployed URL and send a message to check.

## Give the bot its job

Open `lib/chatbot/system-prompt.ts`. The comments walk you through it: who the users are, what
the bot helps with, how it talks, and what it must not do. The example is "Neighbor", a guide
to Chicago city services. Replace it with your idea, update the starter questions, then clear
the chat and try it.

## When something goes wrong

The page shows a plain-language error and the details are printed in the terminal running
`pnpm dev` (or your Vercel logs).

| Message | Fix |
|---|---|
| "The Anthropic API key was rejected" | Check the key in `.env.local`, no quotes or spaces, then restart. |
| "Claude could not find that model" | Fix `ANTHROPIC_MODEL`, or leave it empty. |
| "Check your Anthropic account's credit balance" | Add credit under Billing. |
| "Too many requests" | Wait a minute; you hit your account's rate limit. |
| Still says demo mode | Restart `pnpm dev` after editing `.env.local`; on Vercel, redeploy. |
