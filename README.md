# Product Portfolio

Static portfolio for hiring managers. **Live:** https://rajeevcode.github.io/product-portfolio/

Author: Rajeev Kumar · Last updated: June 2026 · License: [MIT](LICENSE)

**Featured AI systems:**
- [Rescale OS](Profile-rescale-os/index.html) — AI Creative & Campaign Operations Platform
- [Creative Marketing Agents / Rescale Operator](rescale-operator/creative-marketing-agents/index.html) — AI Automation OS for Creative & Campaign Operations
- [Pulsara](Pulsara-Portfolio/index.html) — AI Innovation Signal Intelligence System

**Product Manager case studies:**
- [HafH / Kabuk Style](hafh-kabuk-style/index.html) — AI Pricing & Travel Platform Growth
- [Mumzworld / Tamer Group](mumzworld-tamer-group/index.html) — B2B Commerce, Payments & Automation Platform
- [Jumia Group](jumia-marketplace-ops/index.html) — Marketplace Data Operations & Customer Workflow Automation
- [Lazada / Alibaba Group](lazada-alibaba-growth/index.html) — Marketplace Payments, Checkout & Growth Platform

**Education:**
- [International MBA Portfolio](education-mba/index.html) — Strategy, Finance & AI Product Leadership

## Run locally

```bash
cd /Users/rajeevkumar/Desktop/ai-automation-portfolio
npm run serve          # static server on :8092
```

- Portfolio home: http://localhost:8092/rescale-operator/index.html
- Pulsara case study: http://localhost:8092/Pulsara-Portfolio/index.html

Use the `index.html` URL (or hard-refresh if you previously hit a cached redirect).

## Regression test — run before every change

End-to-end check of structure, links, assets (no broken media), path portability
(no absolute `/Folder/` paths that break on GitHub Pages), content/metric
preservation, design-system integrity, and deploy config. Read-only — never edits files.

```bash
npm test               # starts its own server, runs all checks, exits 0/1
npm run test:ci        # if a server is already running on :8092
```

When you intentionally add a page or change a metric, update the expectation lists
at the top of [`test/regression.mjs`](test/regression.mjs).

## Deployment

GitHub Pages deploys from `main` via `.github/workflows/pages.yml` (ships the repo
root). The repo must be **public** for Pages on the free plan. `Profile-rescale-os/`
content is published; `Portfolio CV Design/` (mockup) and `node_modules/` are gitignored.
