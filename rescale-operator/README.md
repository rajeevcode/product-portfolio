# AI Automation Portfolio

Hiring-manager-ready portfolio — one flagship case study plus shipped modules.

## View locally

```bash
cd rescale-operator
python3 -m http.server 8765
```

| Page | URL |
|------|-----|
| Portfolio home | http://localhost:8765/index.html |
| **Case study** | http://localhost:8765/creative-marketing-agents/index.html |

## Featured project

**Creative Marketing Agents / Rescale Operator** — AI Automation OS for Creative & Campaign Operations.

One platform covering creative workflow automation, campaign QA, naming checks, winner notifier, launch readiness, HITL review, and the campaign QA dashboard.

Screenshots and video live in `rescale-operator/` (asset folder). The case study page is `creative-marketing-agents/index.html`.

## Structure

```
rescale-operator/
├── index.html                         ← Portfolio home
├── creative-marketing-agents/
│   └── index.html                     ← Unified case study (start here for hiring managers)
├── rescale-operator/                  ← Screenshots, video, docs (assets + redirect)
├── winner-notifier/ …                 ← Module pages
└── assets/
```

## Deploy

See root `README.md` — Vercel, Netlify, or GitHub Pages.

## Contact

Edit `assets/site-config.js` for email, LinkedIn, target roles.
