# What I built

## Elevator pitch

I built **Rescale Operator** — an AI-assisted media-buying operations platform that gives performance marketers a daily checkpoint dashboard, automated **winner detection on new ad launches**, operator intelligence screens, and a read-only **agent memory / RAG** layer for asking questions over historical run data.

---

## 1. Winner Notifier (New Launch Winner Tracker)

**Problem:** When a brand launches hundreds of new Meta ads per week, buyers miss emerging winners until spend has already scaled on losers.

**What I shipped:**

- Daily job that pulls ad-level metrics from **Ecom Profits** (`meta_ads_dashboard_view`), classifies each ad (winner / emerging / needs watch / loser / paused), and persists snapshots + events in **Supabase**.
- **Dashboard card** on the daily home page — summary counts, new launches, emerging winners, filterable lists.
- **REST API:** `GET /api/winners/summary`, `/new-launches`, `/events`, and `POST /api/winners/check` (async via Arq — returns 202, worker runs ~7 min for large accounts).
- **Cron:** 06:30 UTC fan-out per active brand.
- **Optional spend×ROAS tier ladder** (winner / superwinner / loser) behind a feature flag.

**Impact you can cite:**

- DryWear UAT: **1,620 ads** checked per run, **2 winners**, **47 emerging**, **128 needs watch** (14-day lookback).
- Reduced HTTP timeouts by moving long checks off the API thread into background workers.

**Screenshot:** `screenshots/01-dashboard-home.png` (Winner Notifier card on dashboard)

---

## 2. Daily dashboard (Next.js + FastAPI)

**What I shipped:**

- Claude-inspired **“Today’s checkpoint”** hero with real briefing timestamps (no fake data).
- **V2 widgets** (feature-flagged): KPI overview, product breakdown, date-range picker, recommendations panel.
- Top nav: Runs, Recommendations, Trigger, Intelligence (Naming, Creative, Explore/Expand, Meta health), Settings.
- **Operator workspace** — action queue, run history, live integrations pulse.

**Screenshots:** `01-dashboard-home`, `02-runs`, `03-recommendations`, `05-operator`, `07`–`10` intelligence screens.

---

## 3. Agent Memory + RAG (read-only)

**What I shipped:**

- Backend: Supermemory client, ingest pipeline, RAG context provider, `/api/agents/query` with Redis-backed task registry (multi-worker safe).
- Frontend: **Agent Memory** panel (`/daily/d/agents/memory`) — ask questions, view proposals (HITL promote behind separate flag).
- Hermes Agents, OpenRouter, and Claude providers for LLM routing.
- Meta API, ClickUp API, Google Sheets API, and Discord notification integrations.

**Screenshot:** enable `NEXT_PUBLIC_AGENT_MEMORY=true` and re-capture (flag off in default Docker build).

---

## 4. Platform & reliability work

- **Tenant-scoped** API reads, Redis SSE fan-out for run events.
- **Publish approvals** persistence (HITL write path).
- **Weekly CRO** integration hooks (Profit Engineering).
- **Docker full-stack** compose: API `:8001`, Next `:3100`, worker, Redis.
- **Tests:** unit + contract + Playwright e2e; migration `0026_winner_notifier.sql`.

---

## STAR example (Winner Notifier)

| | |
|---|---|
| **Situation** | Large Meta account (DryWear / alluria.de) — 1,600+ active ads; manual winner reviews didn’t scale. |
| **Task** | Automate daily classification and surface new winners/emerging ads in the operator dashboard. |
| **Action** | Built classifier + aggregator from Ecom Profits view, Supabase snapshot/event schema, async worker pipeline, dashboard UI, feature flags, batch DB writes after fixing N+1 timeouts. |
| **Result** | End-to-end check runs in background; dashboard shows same-day winner events; ops can trigger manual check via API without blocking HTTP. |

---

## Video walkthrough

See `video/dashboard-walkthrough.webm` — automated tour of dashboard → runs → recommendations → operator → intelligence → settings → trigger.
