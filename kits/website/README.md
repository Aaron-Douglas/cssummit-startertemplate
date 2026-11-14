# Website kit

The pages most project sites need: **About**, **Contact** and **Updates**. No accounts, no keys.

```bash
pnpm kit add website
```

| Route | What it shows | Edit this first |
|---|---|---|
| `/about` | Mission, team grid (initials, no photos), FAQ | The constants at the top of `app/about/page.tsx` |
| `/contact` | A form checked on the server with zod | `lib/website/contact-action.ts` → `deliver()` |
| `/updates` | Posts, newest first | `content/updates/*.ts` |
| `/updates/<slug>` | One post | Same files |

Nav links (About, Updates, Contact) are added for you.

## Add an update

1. Copy `content/updates/first-prototype.ts` to a new file, for example `content/updates/demo-day.ts`.
2. Rename the export (`export const demoDay`), then change `slug`, `title`, `date` (`"YYYY-MM-DD"`),
   `summary` and `body`. The `slug` becomes the URL: `/updates/demo-day`.
3. Import it in `content/updates/index.ts` and add it to the `updates` list.

A body is a list of blocks: a string is a paragraph, `{ heading: "..." }` is a subheading and
`{ list: ["...", "..."] }` is a bulleted list. Delete the sample posts when you have your own.

## Make the contact form deliver messages

Out of the box the form validates the message, shows "Message received" and writes the message
to the server log (your `pnpm dev` terminal, or the Vercel logs). Nothing is emailed or stored.

To receive messages, edit `deliver()` in `lib/website/contact-action.ts`. The comment there
lists the options (an email service, a Supabase table from the `app` kit, or a webhook). Any key
goes in `.env.local`, is read through `lib/env.ts` with `optionalServerEnv("NAME")`, and is listed
in `.env.example`. Never put a key in a `NEXT_PUBLIC_` variable.

Change the rules (required fields, lengths, error messages) in `lib/website/contact-schema.ts`.

## Files

```
app/about/page.tsx               app/contact/page.tsx
app/updates/page.tsx             app/updates/[slug]/page.tsx
components/website/              contact-form, faq, team-grid, update-body
lib/website/                     contact-schema, contact-action, updates
content/updates/                 one file per post + index.ts
```
