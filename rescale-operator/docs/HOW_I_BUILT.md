# How I built it

## Architecture (high level)

```
Browser (Next.js :3100)
    │  /api/* proxy
    ▼
FastAPI (:8001) ──enqueue──▶ Redis ──▶ Arq worker
    │                              │
    ├── Supabase (operator DB)     ├── run_daily_check / winner_notifier
    │   snapshots, events, runs    │
    └── Ecom Profits Postgres      └── cron fanout (06:30 UTC)
        (read-only meta_ads view)
```

---

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React, TanStack Query, Tailwind, Framer Motion |
| API | FastAPI, Pydantic v2, feature-flagged routers |
| Workers | Arq + Redis, cron schedules in `arq_settings.py` |
| Data | Supabase Postgres (asyncpg), Ecom Profits read-only pool |
| AI | Hermes Agents, OpenRouter, Claude provider, Supermemory RAG |
| Integrations | Meta API, ClickUp API, Google Sheets API, Discord notifications |
| Infra | Docker Compose full stack, env-driven feature flags |
| Testing | pytest (unit + contract), Vitest, Playwright e2e |

---

## Winner Notifier — implementation depth

### Data pipeline

1. **Fetch metrics** — 14-day ad-day rows from `meta_ads_dashboard_view` (not 90d — avoids 50k row cap).
2. **First-seen dates** — separate `MIN(date) GROUP BY ad_id` query for launch age.
3. **Aggregate** — roll up spend, ROAS, CTR, trends (1d/3d/7d) per ad in Python (`aggregator.py`).
4. **Classify** — rule engine with brand criteria from `config/brands.yaml` (`classifier.py`); paused ads gated via `ad_effective_status`.
5. **Persist** — batch upserts to `ad_launch_tracking`, `ad_winner_snapshots`, `ad_winner_events` (migration 0026).

### Performance fixes (code review → production)

| Issue | Fix |
|-------|-----|
| HTTP timeout on `POST /check` | Enqueue Arq job, return **202** |
| N+1 DB (~5k queries) | Batch repo methods in one transaction |
| Null trend counted as positive | `_trend_positive` returns false when deltas missing |
| 90d fetch truncated at 50k rows | Split metrics (14d) + first-seen query |
| Cron wrong tenant | Pass `tenant_id` through worker + env |

### API design

- Reads: tenant-scoped, `meta.isRealData` reflects Supabase vs in-memory repo.
- Writes: admin-only manual check; notifications update `notification_status` (skipped/sent).

---

## Frontend patterns

- **Feature flags** baked at build time (`NEXT_PUBLIC_*`) — safe partial rollout.
- **URL migration** middleware `/d` → `/daily/d` with 301 redirects.
- **Error boundaries** per dashboard widget so one failed API doesn’t blank the page.
- **Date range** context drives briefing refresh overlay.

---

## How I validated

1. **Unit tests** — classifier edge cases (paused, null trend, zero impressions).
2. **Contract tests** — `/api/winners/*` wire shape, 503 when repo unwired.
3. **Docker UAT** — `curl POST /api/winners/check` → 202; worker log shows 401s completion for DryWear.
4. **Playwright** — dashboard e2e with v2 flags ON; screenshot + video capture scripts for portfolio.

---

## Commands I used daily

```bash
# Full stack
docker compose -f docker-compose.full.yml up -d --build api worker frontend-next

# Trigger winner check (async)
curl -X POST http://localhost:8001/api/winners/check \
  -H "Content-Type: application/json" \
  -d '{"brand":"DryWear"}'

# Tests
uv run pytest tests/unit/winner_notifier tests/contract/test_winners_endpoint.py
cd frontend-next && pnpm test && pnpm e2e
```

---

## Design decisions worth mentioning in interviews

1. **Feature flags everywhere** — ship dark, enable per env without redeploying logic.
2. **Read-only Ecom Profits pool** — `default_transaction_read_only = on` defense in depth.
3. **Worker for heavy work** — API stays responsive; ops get job id immediately.
4. **Event table vs snapshot-only** — “new winners today” counts events, not stale winner status (avoids daily inflation).
5. **Idempotent events** — unique on `(tenant, ad, event_type, date)`; regression sets `ended_at` on open events.

---

## Repo structure (key paths)

```
src/rescale_operator/winner_notifier/   # classifier, service, notifications
src/rescale_operator/api/routes/winners.py
src/rescale_operator/workers/arq_settings.py
frontend-next/src/components/dashboard/winner-notifier.tsx
supabase/migrations/0026_winner_notifier.sql
Portfolio/                            # local case-study site (gitignored)
```
