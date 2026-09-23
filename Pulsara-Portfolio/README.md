# Pulsara Portfolio

Visual product portfolio case study for **Pulsara — AI Innovation Signal Intelligence System**.

Built to match the premium style of [Rajeev Kumar's AI Product & Automation Portfolio](../rescale-operator/index.html).

## Open locally

```bash
cd Pulsara-Portfolio
npx --yes serve . -p 8090
```

Then open [http://localhost:8090](http://localhost:8090).

Or open `index.html` directly in a browser (relative asset paths work).

## Contents

| Path | Purpose |
|------|---------|
| `index.html` | Full case study page (hero → CTA) |
| `assets/styles.css` | Portfolio design system (white / navy / indigo) |
| `assets/screenshots/` | Real dashboard PNGs from the Pulsara product |
| `assets/video/` | Drop Loom exports or MP4 walkthroughs here |
| `build.mjs` | Regenerates `index.html` from structured section data |

## Screenshots

Captures are from the shipped Pulsara dashboard:

- **Analytics** — KPIs, clusters, trend intelligence, automation status
- **Signals** — inbox with revenue impact badges
- **AI Brief** — leadership briefing, action items, themed sections
- **Creative Intel** — creative opportunity scoring
- **AI Usage** — budget guardrails and cost tracking

## Capture real screenshots & videos

Requires Pulsara running at **http://localhost:3000** (Docker or `npm run dev`).

```bash
cd Pulsara-Portfolio
npm install playwright   # first time only
npx playwright install chromium
PULSARA_PASSWORD=your-password node scripts/capture-portfolio.mjs
node scripts/transcode-all-videos.mjs   # MP4 for Safari — required for playback
node build.mjs
```

Outputs:

- `assets/screenshots/01-…16-*.png` — one per dashboard surface (live captures)
- `assets/video/*.webm` — Playwright recordings
- `assets/video/*.mp4` — H.264 copies for Safari + Chrome (use these in the browser)
- `capture-log.json` — manifest with timestamps

Skip re-capturing screenshots: `SKIP_SCREENSHOTS=1`. Re-record one video: `FORCE_VIDEOS=signal-ingestion.webm`. Existing `.webm` files are skipped unless forced.

**If videos show an error in Safari:** hard refresh (`Cmd+Shift+R`) after running `transcode-all-videos.mjs` + `build.mjs`.

## Regenerate page

After editing section data in `build.mjs`:

```bash
node build.mjs
```

## Product context

Pulsara ingests competitor, market, customer, campaign, and internal product signals; filters noise; detects patterns; scores opportunities; and routes high-priority signals into roadmap inputs, experiments, alerts, and team actions. See the main repo [README](../README.md).
