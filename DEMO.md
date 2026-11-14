# Storm Watch demo

Live Chicago weather, three ways: a map, a chatbot and a game, all built on the starter in six
small steps. Each step is one commit with a git tag, so you can jump to any of them and see
the code at that point.

Weather data by [Open-Meteo.com](https://open-meteo.com) (CC BY 4.0). No API key needed.

## How to jump to a stage

```bash
git switch --detach storm-watch-3-map   # any tag below; then pnpm install && pnpm dev
git switch demo/storm-watch             # back to the finished demo
```

## The stages

| Tag | What changed |
|---|---|
| `storm-watch-1-base` | Ran `pnpm start-project --name "Storm Watch" --kits map,chatbot,game --design soft --yes`. Set the tagline in `lib/site.ts` to "Live Chicago weather, three ways." |
| `storm-watch-2-data` | Added `lib/weather.ts`, the only file that calls Open-Meteo: one request for eight neighbourhoods, cached for about 10 minutes with `"use cache"`. If the request fails or takes more than 4 seconds, the page gets clearly labelled sample data instead, and the failure is not cached. `lib/weather-data.ts` holds the neighbourhoods, types, the weather-code → condition mapping and the sample readings. `components/weather-attribution.tsx` has the Open-Meteo credit and the "Sample data (live weather unavailable)" note. |
| `storm-watch-3-map` | `/map` shows the eight neighbourhoods with their current condition (clear, cloudy, fog, rain, snow, storm) as the filters and marker colours. Popups show temperature, wind, precipitation and the time of the reading. Fog shares cloudy's colour: there are six conditions and five chart colours. |
| `storm-watch-4-chat` | The chatbot is now "Storm Watch". Every message, the server adds the current readings to the system prompt as "Facts you can rely on". The bot answers only from those, points to weather.gov/lot for severe weather and 911 for emergencies. New starter questions; demo replies (no API key) sound like Storm Watch but never make up weather numbers. |
| `storm-watch-5-game` | `/play` reads the Loop's weather and sets today's storm level (0–3) in `lib/game/storm.ts`: more rain means faster drops, thunderstorms bring more hail, snow turns drops into snowflakes, clear skies make a calm round. The settings reach the game as a `tuning` prop on `<Game>`. |
| `storm-watch-6-done` | This file. |

## Things to know when you demo it

- Weather is fetched when someone visits, not when the site is built, so it is always current
  (to within about 10 minutes).
- No internet, or Open-Meteo is down? Every page still works and shows "Sample data (live
  weather unavailable)". The sample readings cover every condition, so the map, chat and game
  all have something to show.
- The chatbot needs your team's own `ANTHROPIC_API_KEY` for real answers (see
  `kits/chatbot/README.md`). Without it, it runs in demo mode with pre-written replies.
