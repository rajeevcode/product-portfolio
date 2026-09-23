# Rescale OS — AI Product Case Study (Interview Portfolio)

Interview-ready case-study page for **Rajeev Kumar**, positioning **Rescale OS** as a
production-grade AI operating system for creative lifecycle, campaign intelligence, naming QA,
winner detection, performance intelligence, launch readiness, and marketing automation.

> **This folder is gitignored** (`Profile-rescale-os/` in the repo root `.gitignore`). It is for
> interview prep and personal positioning only and is **not** committed or published unless
> explicitly approved later.

## View locally

```bash
cd Profile-rescale-os
python3 -m http.server 8799
# open http://localhost:8799/
```

Or just open `index.html` directly in a browser (the SVG placeholders and layout work over
`file://`; the `<video>` cards need a server only once real media is added).

## Structure

```
Profile-rescale-os/
├── index.html              ← full case study (15 sections)
├── README.md
└── assets/
    ├── styles.css          ← portfolio design system (Inter, dark blue-indigo) + case-study extensions
    ├── site-config.js      ← contact + target roles (window.SITE)
    ├── contact.js          ← injects email/LinkedIn/GitHub/portfolio + role tags
    ├── gallery.js          ← data-driven screenshot + video cards
    ├── app.js              ← smooth scroll + screenshot lightbox
    ├── screenshots/        ← 22 labeled SVG placeholders (NN-name.svg)
    └── video/              ← drop real .mp4 walkthroughs here (see video/README.txt)
```

## Replacing placeholders with real media

**Screenshots** — current cards reference `assets/screenshots/NN-name.svg`. When you capture real
PNGs:

1. Save each as `assets/screenshots/NN-name.png` (same number + slug).
2. In `assets/gallery.js`, change the `shotPath()` extension from `.svg` to `.png` (one line), or
   keep both and update per-card. The video poster references in `gallery.js` also use `.svg` — update
   those extensions too if you want real poster frames.

**Videos** — drop files into `assets/video/` using the exact names listed in
`assets/video/README.txt`. No HTML change needed; the `<source>` paths already point there. Until a
file exists, each card shows its poster + a "video coming soon" fallback link.

## Editing contact details / roles

Edit `assets/site-config.js` — `email`, `linkedin`, `github`, `portfolio`, and the `roles[]` array
that renders the target-role chips.

## Money-saved figures

The Impact section has a **Money saved / value created** block with four `[ADD VALUE]` placeholder
rows. These are intentionally blank estimate fields — fill them in `index.html` when you have
validated numbers. No figures are invented.
