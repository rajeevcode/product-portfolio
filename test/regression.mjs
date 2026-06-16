#!/usr/bin/env node
/**
 * End-to-end regression test for the AI Automation Portfolio.
 *
 * Checks everything that has broken (or could break) on past changes:
 *   1. Structure       — every expected page + asset exists on disk
 *   2. HTTP            — every page + key asset serves 200 from a local server
 *   3. Assets          — every <img>/<video>/<source>/<script>/<link> ref resolves on disk (no broken media)
 *   4. Portability     — no absolute "/Folder/..." paths or stray <base href> that break under a sub-path
 *   5. Content/metrics — required metrics, links, and labels are still present (content-preservation)
 *   6. Design system   — restyled pages link the Geist font + theme.css/theme-overlay.css
 *   7. Links           — internal href targets resolve on disk
 *   8. Deploy          — Pages workflow ships repo root; root index.html forwards
 *
 * Usage:
 *   node test/regression.mjs            # starts its own `npx serve` on :8092, runs all checks
 *   node test/regression.mjs --no-serve # assume a server is already running on BASE
 *   BASE=http://localhost:9000 node test/regression.mjs --no-serve
 *
 * Exit code 0 = all passed, 1 = one or more failures.
 *
 * SAFETY: read-only. Never edits, deletes, or moves any file.
 */

import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, dirname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.env.BASE || "http://localhost:8092";
const SELF_SERVE = !process.argv.includes("--no-serve");
const SERVE_PORT = 8092;

/* ----------------------------------------------------------------- expectations
   Update these lists when you intentionally add/rename pages or change metrics. */

// Top-level pages served from repo root.
const PAGES = [
  "index.html",                                   // root forwarder
  "rescale-operator/index.html",                  // homepage hub
  "Pulsara-Portfolio/index.html",
  "rescale-operator/creative-marketing-agents/index.html",
  "Profile-rescale-os/index.html",
  "hafh-kabuk-style/index.html",
  "mumzworld-tamer-group/index.html",
  "jumia-marketplace-ops/index.html",
  "lazada-alibaba-growth/index.html",
  "education-mba/index.html",
];

// Rescale module sub-pages (must keep loading; not restyled).
const MODULE_PAGES = [
  "winner-notifier", "daily-checkpoint", "diagnostic-engine",
  "naming-convention-qa", "agent-memory", "weekly-cro", "document-intelligence",
].map((m) => `rescale-operator/${m}/index.html`);

// Case-study pages that MUST be on the new design system (Geist + theme css).
const THEMED_PAGES = [
  "rescale-operator/index.html",
  "Pulsara-Portfolio/index.html",
  "rescale-operator/creative-marketing-agents/index.html",
  "Profile-rescale-os/index.html",
  "hafh-kabuk-style/index.html",
  "mumzworld-tamer-group/index.html",
  "jumia-marketplace-ops/index.html",
  "lazada-alibaba-growth/index.html",
  "education-mba/index.html",
];

// Content-preservation assertions: substring MUST appear in the page (verbatim).
const CONTENT = {
  "hafh-kabuk-style/index.html": ["200K+", "65+ countries", "753K", "confidential; public URL unavailable", "https://www.hafh.com/"],
  "mumzworld-tamer-group/index.html": ["$2.1M", "T+5", "60%", "confidential; public URL unavailable", "https://www.mumzworld.com/en"],
  "jumia-marketplace-ops/index.html": ["$185K", "11 African", "60%", "confidential; public URL unavailable", "https://group.jumia.com/"],
  "lazada-alibaba-growth/index.html": ["5.3%", "12.2%", "$5M", "18%", "confidential; public URL unavailable", "https://www.lazada.com/"],
  "Pulsara-Portfolio/index.html": ["2,000+", "70%", "pulsara.rescale.media"],
  "education-mba/index.html": ["17/20", "60 ECTS", "3.22", "AMBA", "Detailed capstone content to be added by Rajeev"],
  "rescale-operator/index.html": [
    "github.com/rajeevcode", "medium.com/@rajeev25",
    "Digital Transformation", "AI Engineer", "Strategy",
    "Featured AI systems", "Work experience", "Education",
    // CV timeline: Rescale Media current role leads, all roles dated
    "Rescale Media", "Jan 2024 - Present",
    "Sep 2023 - Jul 2024", "Aug 2021 - Aug 2023",
    "Nov 2019 - Oct 2020", "Jan 2017 - Nov 2019",
  ],
};

// Key deployable assets that must serve 200 (sample of real media).
const KEY_ASSETS = [
  "rescale-operator/assets/theme.css",
  "Pulsara-Portfolio/assets/theme-overlay.css",
  "Pulsara-Portfolio/assets/screenshots/01-executive-overview.png",
  "Profile-rescale-os/assets/screenshots/01-dashboard-overview.png",
];

/* ------------------------------------------------------------------- harness */
let pass = 0, fail = 0;
const failures = [];
function ok(msg) { pass++; }
function bad(msg) { fail++; failures.push(msg); }
function check(cond, msg) { cond ? ok(msg) : bad(msg); }
function section(name) { process.stdout.write(`\n— ${name}\n`); }

const readPage = (rel) => readFileSync(join(ROOT, rel), "utf8");

// Extract href/src values from an HTML string.
function refs(html) {
  const out = [];
  const re = /(?:href|src)\s*=\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
}

async function head(url) {
  try {
    const r = await fetch(url, { redirect: "follow" });
    return r.status;
  } catch {
    return 0;
  }
}

/* --------------------------------------------------------------- the checks */

function checkStructure() {
  section("1. Structure — pages exist on disk");
  for (const p of [...PAGES, ...MODULE_PAGES]) {
    check(existsSync(join(ROOT, p)), `missing page: ${p}`);
  }
}

function checkAssetRefsResolve() {
  section("3. Assets — every local href/src resolves on disk (no broken media)");
  for (const p of [...PAGES, ...THEMED_PAGES].filter((v, i, a) => a.indexOf(v) === i)) {
    if (!existsSync(join(ROOT, p))) continue;
    const html = readPage(p);
    const pageDir = dirname(join(ROOT, p));
    for (const ref of refs(html)) {
      if (/^(https?:|mailto:|tel:|#|data:)/.test(ref)) continue; // external/anchor
      const clean = ref.split("#")[0].split("?")[0];
      if (!clean) continue;
      const target = clean.startsWith("/")
        ? join(ROOT, clean.slice(1))     // root-absolute (should not happen post-fix)
        : normalize(join(pageDir, clean));
      check(existsSync(target), `broken ref in ${p}: "${ref}"`);
    }
  }
}

function checkPortability() {
  section("4. Portability — no absolute /Folder/ paths or stray <base href>");
  const folders = ["Pulsara-Portfolio", "hafh-kabuk-style", "mumzworld-tamer-group",
    "jumia-marketplace-ops", "lazada-alibaba-growth", "education-mba"];
  for (const p of PAGES) {
    if (!existsSync(join(ROOT, p))) continue;
    const html = readPage(p);
    check(!/<base\s+href="\//.test(html), `stray absolute <base href> in ${p}`);
    for (const f of folders) {
      check(!html.includes(`="/${f}/`), `absolute "/${f}/" ref in ${p} (breaks under sub-path)`);
    }
  }
}

function checkContent() {
  section("5. Content & metrics preservation");
  for (const [p, needles] of Object.entries(CONTENT)) {
    if (!existsSync(join(ROOT, p))) { bad(`page for content check missing: ${p}`); continue; }
    const html = readPage(p);
    for (const n of needles) check(html.includes(n), `content missing in ${p}: "${n}"`);
  }
}

function checkDesignSystem() {
  section("6. Design system — Geist font + theme css linked");
  for (const p of THEMED_PAGES) {
    if (!existsSync(join(ROOT, p))) continue;
    const html = readPage(p);
    check(/family=Geist/.test(html), `Geist font not linked in ${p}`);
    check(/theme(-overlay)?\.css/.test(html), `theme css not linked in ${p}`);
    check(!/family=Inter/.test(html), `legacy Inter font still linked in ${p}`);
  }
}

function checkInternalLinks() {
  section("7. Internal links resolve on disk");
  const hub = "rescale-operator/index.html";
  const html = readPage(hub);
  const pageDir = dirname(join(ROOT, hub));
  for (const ref of refs(html)) {
    if (!ref.endsWith("index.html")) continue;
    if (/^https?:/.test(ref)) continue;
    const target = normalize(join(pageDir, ref.split("#")[0]));
    check(existsSync(target), `homepage link target missing: ${ref}`);
  }
}

function checkDeployConfig() {
  section("8. Deploy config");
  const wf = join(ROOT, ".github/workflows/pages.yml");
  if (existsSync(wf)) {
    const y = readFileSync(wf, "utf8");
    check(/path:\s*\.\s*$/m.test(y), "pages.yml must ship repo root (path: .)");
  } else bad("missing .github/workflows/pages.yml");
  check(existsSync(join(ROOT, ".nojekyll")), "missing root .nojekyll");
  const rootIdx = readPage("index.html");
  check(/url=rescale-operator\/index\.html/.test(rootIdx), "root index.html should forward to homepage hub");
}

// helper: text nodes only (strip tags so attributes/URLs/code don't count)
function textOnly(html) {
  return html.replace(/<[^>]*>/g, " ");
}

function checkNoVisibleEmail() {
  section("9. Email privacy — raw address never appears as visible text");
  const EMAIL = "rajeevkmba2025@gmail.com";
  for (const p of [...PAGES, ...MODULE_PAGES]) {
    if (!existsSync(join(ROOT, p))) continue;
    const txt = textOnly(readPage(p));
    check(!txt.includes(EMAIL), `raw email visible as text in ${p}`);
    // mailto must still be present somewhere with a contact entry
  }
  // mailto links preserved on the contact pages
  for (const p of ["rescale-operator/index.html", "Profile-rescale-os/index.html"]) {
    check(readPage(p).includes("mailto:" + EMAIL), `mailto link missing in ${p}`);
  }
  // contact.js must not assign email to textContent except the email-label opt-in
  for (const p of PAGES) {
    const jsPath = join(dirname(join(ROOT, p)), "assets/contact.js");
    if (!existsSync(jsPath)) continue;
    const js = readFileSync(jsPath, "utf8");
    // the only allowed textContent=site.email is inside the email-label block
    const emailBlock = js.split("email-label")[0]; // text before the opt-in block
    check(!/textContent\s*=\s*["']?\s*\+?\s*site\.email|textContent\s*=\s*site\.email/.test(emailBlock),
      `contact.js (${p}) sets email as textContent on data-contact='email'`);
  }
}

function checkNoProseDashes() {
  section("10. Prose cleanup — no em/en dashes in visible text");
  const CLEANED = [
    "rescale-operator/index.html", "Profile-rescale-os/index.html",
    "Pulsara-Portfolio/index.html", "hafh-kabuk-style/index.html",
    "mumzworld-tamer-group/index.html", "jumia-marketplace-ops/index.html",
    "lazada-alibaba-growth/index.html", "education-mba/index.html",
    "rescale-operator/creative-marketing-agents/index.html",
  ];
  for (const p of CLEANED) {
    if (!existsSync(join(ROOT, p))) continue;
    const txt = textOnly(readPage(p));
    check(!txt.includes("—"), `em dash (—) in visible text of ${p}`);
    check(!txt.includes("–"), `en dash (–) in visible text of ${p}`);
  }
  // flagged AI phrases removed from visible prose (word-boundary so "real screens"
  // does not match the legitimate word "screenshots")
  const PHRASES = [
    /not a gimmick/i, /not aspiration/i, /real bottleneck/i,
    /real product flow/i, /real screens\b/i, /interview-ready/i,
  ];
  for (const p of CLEANED) {
    if (!existsSync(join(ROOT, p))) continue;
    const txt = textOnly(readPage(p));
    for (const re of PHRASES) check(!re.test(txt), `flagged phrase ${re} still visible in ${p}`);
  }
}

async function checkHttp() {
  section("2. HTTP — pages & key assets serve 200");
  for (const p of [...PAGES, ...MODULE_PAGES]) {
    const s = await head(`${BASE}/${p}`);
    check(s === 200, `HTTP ${s} for /${p}`);
  }
  for (const a of KEY_ASSETS) {
    const s = await head(`${BASE}/${a}`);
    check(s === 200, `HTTP ${s} for asset /${a}`);
  }
}

/* ------------------------------------------------------------------- runner */
async function waitForServer(url, tries = 30) {
  for (let i = 0; i < tries; i++) {
    if ((await head(url)) !== 0) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

async function main() {
  let server;
  if (SELF_SERVE) {
    process.stdout.write(`Starting local server on :${SERVE_PORT} …\n`);
    server = spawn("npx", ["--yes", "serve", ".", "-p", String(SERVE_PORT), "-L"], {
      cwd: ROOT, stdio: "ignore", detached: true,
    });
    const up = await waitForServer(`${BASE}/rescale-operator/index.html`);
    if (!up) { console.error("Could not start local server."); process.exit(1); }
  }

  // disk + content checks (no server needed)
  checkStructure();
  checkAssetRefsResolve();
  checkPortability();
  checkContent();
  checkDesignSystem();
  checkInternalLinks();
  checkDeployConfig();
  checkNoVisibleEmail();
  checkNoProseDashes();
  // http checks
  await checkHttp();

  if (server) { try { process.kill(-server.pid); } catch {} }

  process.stdout.write(`\n${"=".repeat(48)}\n`);
  if (fail === 0) {
    process.stdout.write(`✅ ALL PASSED — ${pass} checks\n`);
    process.exit(0);
  } else {
    process.stdout.write(`❌ ${fail} FAILED, ${pass} passed\n\n`);
    for (const f of failures) process.stdout.write(`  ✗ ${f}\n`);
    process.exit(1);
  }
}

main();
