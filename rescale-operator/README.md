# AI Automation Portfolio

Hiring-manager-ready portfolio showcasing AI product and automation work — two flagship case studies plus shipped platform modules.

## View locally

```bash
cd rescale-operator
python3 -m http.server 8765
```

| Page | URL |
|------|-----|
| Portfolio home | http://localhost:8765/index.html |
| Rescale Operator case study | http://localhost:8765/rescale-operator/index.html |
| Creative Marketing Agents case study | http://localhost:8765/creative-marketing-agents/index.html |

## Structure

```
rescale-operator/
├── index.html                      ← Portfolio home (start here)
├── assets/
├── PROJECTS.md
├── rescale-operator/               ← Case study 1 + screenshots/video
├── creative-marketing-agents/      ← Case study 2
├── daily-checkpoint/
├── diagnostic-engine/
├── naming-convention-qa/
├── winner-notifier/
├── agent-memory/
├── weekly-cro/
└── document-intelligence/
```

## For hiring managers

Each case study follows: **problem → solution → workflow → screenshots → impact → role ownership → technical breakdown**.

Start with either flagship project:
1. **Rescale Operator** — the full operating system (campaign QA, signals, winners, launch readiness)
2. **Creative Marketing Agents** — AI-driven creative intelligence and decision-making

## Regenerate captures

With the app on `:3100` / `:8001`:

```bash
cd frontend-next
pnpm exec node scripts/capture-dashboard-screenshots.mjs
pnpm exec node scripts/record-interview-walkthrough.mjs
pnpm exec node scripts/record-dashboard-dark-scroll.mjs
```

Output: `rescale-operator/screenshots/` and `rescale-operator/video/`.

## Deploy

Three options — pick one:

### Vercel (recommended)

```bash
cd rescale-operator
npx vercel
```

`vercel.json` is included. Set the project root to `rescale-operator/` when importing in the Vercel dashboard.

### Netlify

Drag-and-drop the `rescale-operator/` folder, or connect the repo — `netlify.toml` at repo root sets `publish = "rescale-operator"`.

### GitHub Pages

```bash
git init
git add .
git commit -m "Add AI automation portfolio"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

Then enable **Settings → Pages → GitHub Actions**. The workflow in `.github/workflows/pages.yml` deploys `rescale-operator/` automatically on push to `main`.

## Contact config

Edit `assets/site-config.js` to update email, LinkedIn, or target roles site-wide:

```javascript
window.SITE = {
  email: "rajeev.code@gmail.com",
  linkedin: "https://linkedin.com/in/YOUR-PROFILE",  // add your URL here
  roles: ["AI Product Manager", "Technical Product Manager", ...],
};
```
