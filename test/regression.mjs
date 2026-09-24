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
 *  5c. Employment facts — each work card keeps its CV title and dates; no internal review notes in public copy
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

import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { resolve, dirname, join, normalize, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { runInNewContext } from "node:vm";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.env.BASE || "http://localhost:8092";
const SELF_SERVE = !process.argv.includes("--no-serve");
const SERVE_PORT = 8092;

/* ----------------------------------------------------------------- expectations
   Update these lists when you intentionally add/rename pages or change metrics. */

// Top-level pages served from repo root.
const PAGES = [
  "index.html",                                   // portfolio hub
  "rescale-operator/index.html",                  // legacy route, redirects to hub
  "404.html",                                     // custom GitHub Pages 404 page
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
// (rescale-operator/index.html is now a redirect page, not a themed content page.)
const THEMED_PAGES = [
  "index.html",
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
  "education-mba/index.html": ["17/20", "60 ECTS", "3.22", "AMBA", "Detailed capstone content to be added by Rajeev",
    // FT ranking + public references (added)
    "#21", "Financial Times Global MBA Ranking 2026", "rankings.ft.com", "pbs.up.pt", "up.pt", "ie.edu", "associationofmbas.com",
    // verified PBS credential certificate links
    "certificates.pbs.up.pt", "International MBA 2024/25", "AI Certificate, Young Alumni 2025"],
  // The hub now lives at the repo ROOT (rescale-operator/index.html is a redirect).
  "index.html": [
    "github.com/rajeevcode", "medium.com/@rajeev25",
    "How I create impact", "Product Management", "AI Products &amp; Systems",
    "Digital Transformation &amp; Delivery", "Strategy &amp; Consulting",
    "Featured AI systems", "Work experience", "Education",
    // CV timeline: Rescale Media current role leads, all 7 roles dated incl. foodspring + AJIO
    "Rescale Media", "Jan 2026 - Present",
    "Sep 2023 - Sep 2024", "Sep 2021 - Aug 2023",
    "foodspring", "Mar 2021 - Jul 2021",
    "Sep 2019 - Oct 2020", "Sep 2017 - Sep 2018", "Sep 2018 - Sep 2019",
    "AJIO", "2015 - 2016",
    // Business impact: real attributed metrics (not generic labels)
    "2,000+/day", "$2.1M", "$185K", "$5M+", "17/20",
    // skills regrouped by outcome (expanded)
    "AI Product &amp; Agents", "RAG &amp; AI Memory", "Platform &amp; APIs",
    "Marketplace, Payments &amp; Integrations", "Development &amp; Delivery",
    "Anthropic Claude", "Google Gemini", "Ollama", "LangChain", "pgvector",
    "Visual Studio Code", "Google Antigravity", "OpenAI GPT models",
    // project-visibility lines present (readable, no slash-heavy formatting)
    "Internal product and confidential. Public URL unavailable.",
  ],
};

// Key deployable assets that must serve 200 (sample of real media).
const KEY_ASSETS = [
  "assets/rajeev-kumar-profile.png",
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

// Include posters, responsive sources, and literal image fallback paths.
function refs(html) {
  const out = [];
  const re = /\b(?:href|src|poster)\s*=\s*(["'])(.*?)\1/g;
  let m;
  while ((m = re.exec(html))) out.push(m[2]);
  for (const match of html.matchAll(/\bsrcset\s*=\s*(["'])(.*?)\1/g)) {
    if (match[2].trim().startsWith("data:")) continue;
    out.push(...match[2].split(",").map((source) => source.trim().split(/\s+/)[0]));
  }
  for (const match of html.matchAll(/url\(\s*(["']?)([^)"']+)\1\s*\)/g)) {
    out.push(match[2].trim());
  }
  return out;
}

function publicFiles(dir = ROOT) {
  // Design-tool source folders are gitignored and never deploy.
  const ignored = new Set([".git", "node_modules", ".cache", "dist", "build", "tmp", ".tmp",
    "Portfolio CV Design"]);
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (ignored.has(entry.name) || entry.name.startsWith(".")) return [];
    if (entry.name.startsWith("Product portfolio homepage build")) return [];
    const path = join(dir, entry.name);
    return entry.isDirectory() ? publicFiles(path) : [path];
  });
}

function checkLocalReference(owner, ref) {
  if (!ref || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(ref)) return;
  let clean;
  try {
    clean = decodeURIComponent(ref.split("#")[0].split("?")[0]).replace(/&amp;/g, "&");
  } catch {
    bad(`invalid URL in ${owner}: "${ref}"`);
    return;
  }
  if (!clean) return;
  const target = clean.startsWith("/") ? join(ROOT, clean.slice(1)) : resolve(dirname(join(ROOT, owner)), clean);
  const rel = relative(ROOT, target);
  if (rel === ".." || rel.startsWith(`..${sep}`)) {
    bad(`reference escapes site root in ${owner}: "${ref}"`);
    return;
  }
  if (!existsSync(target)) {
    bad(`broken ref in ${owner}: "${ref}"`);
    return;
  }
  // macOS often accepts wrong-case paths; production Linux does not.
  let cursor = ROOT;
  for (const segment of rel.split(sep).filter(Boolean)) {
    if (!readdirSync(cursor).includes(segment)) {
      bad(`filename case mismatch in ${owner}: "${ref}"`);
      return;
    }
    cursor = join(cursor, segment);
  }
  check(!statSync(target).isFile() || statSync(target).size > 0, `empty referenced file in ${owner}: "${ref}"`);
}

// Execute the actual gallery builder with the DOM surface it uses, rather than
// duplicating its filename list in the test and missing future template changes.
function renderedGallery(html, script) {
  const elements = new Map([...html.matchAll(/\bid=["']([^"']+)["']/g)]
    .map((match) => [match[1], { innerHTML: "" }]));
  runInNewContext(readPage(script), {
    document: { getElementById: (id) => elements.get(id) || null },
  }, { filename: script, timeout: 1000 });
  return [...elements.values()].map((element) => element.innerHTML).join("\n");
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
  section("3. Assets — all HTML, CSS, and rendered gallery media resolve with exact filename case");
  for (const file of publicFiles().filter((path) => /\.(html|css)$/.test(path))) {
    const p = relative(ROOT, file);
    const html = readPage(p);
    for (const ref of refs(html)) checkLocalReference(p, ref);
    if (!p.endsWith(".html")) continue;
    for (const ref of refs(html).filter((value) => /(?:^|\/)gallery\.js$/.test(value))) {
      const script = relative(ROOT, resolve(dirname(file), ref));
      if (!existsSync(join(ROOT, script))) continue; // already reported above
      try {
        const markup = renderedGallery(html, script);
        check(markup.includes("<img"), `gallery did not render screenshots in ${p}`);
        check(markup.includes("<video"), `gallery did not render available recordings in ${p}`);
        for (const media of refs(markup)) checkLocalReference(p, media);
      } catch (error) {
        bad(`gallery render failed in ${p}: ${error.message}`);
      }
    }
  }
}

function checkEmploymentFacts() {
  section("5c. Verified employment titles and dates remain attached to the correct company");
  const hub = readPage("index.html");
  const work = hub.slice(hub.indexOf('id="work"'), hub.indexOf('id="education"'));
  const cards = [...work.matchAll(/<article\b[^>]*class="exp-card[^>]*>([\s\S]*?)<\/article>/g)]
    .map((match) => match[1]);
  const facts = [
    ["Rescale Media", "Senior AI Product Manager, Platform &amp; Agent Systems", "Jan 2026 - Present"],
    ["HafH", "Senior Product &amp; Strategy Manager (Consultant)", "Sep 2023 - Sep 2024"],
    ["Mumzworld", "Senior Manager, Product Strategy", "Sep 2021 - Aug 2023"],
    ["foodspring", "Senior Product &amp; Growth Strategy Manager", "Mar 2021 - Jul 2021"],
    ["Jumia Group", "Senior Product Owner", "Sep 2019 - Oct 2020"],
    ["Lazada", "QA Automation Engineer (Sep 2017 - Sep 2018)", "Technical Product Manager (Sep 2018 - Sep 2019)"],
    ["AJIO", "Ecommerce Tech Manager", "2015 - 2016", "QA Lead, Just Eat (2014 - 2015)", "Test Engineer, Indium Software (2013 - 2014)", "QA Engineer I, Zynga (2011 - 2013)"],
  ];
  for (const [company, ...expected] of facts) {
    const card = cards.find((markup) => new RegExp(`<h3>[^<]*${company}`).test(markup));
    check(Boolean(card) && expected.every((value) => card.includes(value)), `employment facts mismatch for ${company}`);
  }
  const jumiaCard = cards.find((markup) => markup.includes("<h3>Jumia Group</h3>")) || "";
  check(/<p class="exp-title">Senior Product Owner<\/p>/.test(jumiaCard) && jumiaCard.includes("Sep 2019 - Oct 2020"),
    "Jumia homepage formal title must remain Senior Product Owner");
  const jumia = readPage("jumia-marketplace-ops/index.html");
  check(jumia.includes("<dt>Role</dt><dd>Senior Product Owner</dd>"), "Jumia case-study formal title must remain Senior Product Owner");
  const alt = hub.match(/alt="(Hand-drawn career journey[^"]+)"/)?.[1] || "";
  check(alt.includes("13+ years experience"), "career illustration alternative text must preserve 13+ years");
  // Unresolved CV items (Sword Health dates, Career Break overlap) stay off the public site until confirmed.
  check(!/unresolved|needs confirmation|requires chronology/i.test(alt), "career illustration alt text must not publish internal review notes");
}

function checkProfilePhoto() {
  section("3b. Shared profile photograph and social-image references");
  const asset = "assets/rajeev-kumar-profile.png";
  const socialUrl = `https://rajeevcode.github.io/product-portfolio/${asset}`;
  for (const [page, src] of [["index.html", asset], ["Profile-rescale-os/index.html", `../${asset}`]]) {
    const html = readPage(page);
    check(html.includes(`src="${src}" alt="Rajeev Kumar — Senior AI Product Manager"`), `profile photograph or alternative text mismatch in ${page}`);
    checkLocalReference(page, src);
  }
  for (const file of publicFiles().filter((path) => path.endsWith(".html"))) {
    const page = relative(ROOT, file);
    const html = readPage(page);
    for (const match of html.matchAll(/<meta\b[^>]*(?:property|name)="(?:og:image|twitter:image)"[^>]*>/g)) {
      const url = match[0].match(/\bcontent="([^"]+)"/)?.[1];
      check(url === socialUrl, `social profile photograph mismatch in ${page}`);
      if (url === socialUrl) checkLocalReference("index.html", asset);
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

function checkWorkOrder() {
  section("5b. Work-experience chronology order (newest first)");
  // Within the #work section only, the 7 companies must appear in this exact order.
  const html = readPage("index.html");
  const work = html.slice(html.indexOf('id="work"'), html.indexOf('id="education"'));
  const ORDER = ["Rescale Media", "HafH", "Mumzworld", "foodspring", "Jumia Group", "Lazada", "AJIO"];
  let last = -1, ok2 = true;
  for (const name of ORDER) {
    const idx = work.indexOf(">" + name) >= 0 ? work.indexOf(">" + name) : work.indexOf(name);
    if (idx < 0) { bad(`work order: "${name}" not found in #work`); ok2 = false; continue; }
    if (idx < last) { bad(`work order: "${name}" appears out of sequence`); ok2 = false; }
    last = idx;
  }
  check(ok2, "work experience order is Rescale, HafH, Mumzworld, foodspring, Jumia, Lazada, AJIO");
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
  const hub = "index.html";
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
    // security: GitHub Actions pinned to commit SHAs (not mutable tags)
    const usesLines = y.match(/uses:\s*actions\/[^\n]+/g) || [];
    for (const u of usesLines) {
      check(/@[0-9a-f]{40}\b/.test(u), `action not pinned to a commit SHA: ${u.trim()}`);
    }
  } else bad("missing .github/workflows/pages.yml");
  check(existsSync(join(ROOT, ".nojekyll")), "missing root .nojekyll");
  check(existsSync(join(ROOT, "favicon.svg")), "missing root favicon.svg");
  // root index.html IS the hub now; the old rescale-operator route redirects to it
  const rootIdx = readPage("index.html");
  check(/id="featured"/.test(rootIdx) && /Work experience/.test(rootIdx), "root index.html should be the portfolio hub");
  const oldRoute = readPage("rescale-operator/index.html");
  check(/http-equiv="refresh"[^>]*url=\.\.\/index\.html/.test(oldRoute), "rescale-operator/index.html should redirect to root hub");
}

function checkSecurity() {
  section("11. Security hardening");
  // Every deployable page carries a Content-Security-Policy meta
  for (const p of [...PAGES, ...MODULE_PAGES]) {
    if (!existsSync(join(ROOT, p))) continue;
    const html = readPage(p);
    check(/http-equiv="Content-Security-Policy"/.test(html), `missing CSP meta in ${p}`);
    check(/default-src 'self'/.test(html), `CSP missing default-src in ${p}`);
  }
  // No tracked file leaks a JWT-shaped token
  for (const p of [...PAGES, ...MODULE_PAGES]) {
    if (!existsSync(join(ROOT, p))) continue;
    check(!/eyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}/.test(readPage(p)), `possible JWT in ${p}`);
  }
  // Capture script must not hardcode a PII email default
  const cap = "Pulsara-Portfolio/scripts/capture-portfolio.mjs";
  if (existsSync(join(ROOT, cap))) {
    const js = readPage(cap);
    check(!/PULSARA_EMAIL\s*\|\|\s*['"][^'"]*@/.test(js), "capture script hardcodes a PII email default");
  }
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
  // mailto links preserved on the contact pages (hub is now root index.html)
  for (const p of ["index.html", "Profile-rescale-os/index.html"]) {
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
    "index.html", "Profile-rescale-os/index.html",
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
  checkProfilePhoto();
  checkPortability();
  checkContent();
  checkWorkOrder();
  checkEmploymentFacts();
  checkDesignSystem();
  checkInternalLinks();
  checkDeployConfig();
  checkNoVisibleEmail();
  checkNoProseDashes();
  checkSecurity();
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
