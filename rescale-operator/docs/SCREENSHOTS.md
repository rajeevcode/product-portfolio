# Dashboard screen snapshots

PNG captures of the Rescale Operator daily dashboard (`/daily/d`).

Regenerate after UI changes:

```bash
cd frontend-next
pnpm exec playwright install chromium   # first time only
pnpm exec node scripts/capture-dashboard-screenshots.mjs
```

Requires the stack running at **http://localhost:3100** (frontend) with API on **:8001**.

Output: `Portfolio/screenshots/*.png` and `Portfolio/screenshots/manifest.json`.

| File | Route |
|------|-------|
| `01-dashboard-home.png` | `/daily/d` |
| `02-runs.png` | `/daily/d/runs` |
| `03-recommendations.png` | `/daily/d/recommendations` |
| `04-trigger.png` | `/daily/d/trigger` |
| `05-operator.png` | `/daily/d/operator` |
| `06-brands.png` | `/daily/d/brands` |
| `07-intelligence-naming.png` | `/daily/d/intelligence/naming` |
| `08-intelligence-creative.png` | `/daily/d/intelligence/creative` |
| `09-intelligence-explore-expand.png` | `/daily/d/intelligence/explore-expand` |
| `10-intelligence-meta-health.png` | `/daily/d/intelligence/meta-health` |
| `14-creative-agents.png` | `/daily/d/creative` |
| `16-settings-overview.png` … `22-settings-audit.png` | Settings sub-pages |
| `23-weekly-cro-home.png` | `/weekly-cro/d` |
| `01-dashboard-home-dark-full.png` | Full-page dark scroll capture |

Flag-gated routes (Launch QA, Scaling, Agent Memory, Approvals) are skipped when their `NEXT_PUBLIC_*` flags are off — see `manifest.json` for the latest run.
