#!/usr/bin/env node
/**
 * Capture real Pulsara dashboard screenshots and walkthrough videos for the portfolio.
 *
 * Usage:
 *   PULSARA_URL=http://localhost:3000 \
 *   PULSARA_EMAIL=your-email \
 *   PULSARA_PASSWORD=your-password \
 *   node scripts/capture-portfolio.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SHOTS = path.join(ROOT, 'assets', 'screenshots');
const VIDEO = path.join(ROOT, 'assets', 'video');

const BASE_URL = process.env.PULSARA_URL || 'http://localhost:3000';
const EMAIL = process.env.PULSARA_EMAIL || '';
const PASSWORD = process.env.PULSARA_PASSWORD || '';

const TAB = {
  analytics: '📊 Analytics',
  signals: '📡 Signals',
  digest: '🤖 AI Brief',
  creative: '🎯 Creative Intel',
  innovation: '💡 Innovation',
  aiUpdates: '🧠 AI Updates',
  recommendations: '📝 Recommendations',
  usage: '💰 AI Usage',
};

const SCREENSHOTS = [
  { file: '01-executive-overview.png', tab: TAB.analytics, scroll: 0 },
  { file: '02-signal-inbox.png', tab: TAB.signals, scroll: 0 },
  { file: '03-noise-reduction.png', tab: TAB.analytics, scroll: 600 },
  { file: '04-priority-queue.png', tab: TAB.signals, scroll: 400 },
  { file: '05-competitor-intelligence.png', tab: TAB.analytics, scroll: 1200 },
  { file: '06-market-trends.png', tab: TAB.analytics, scroll: 1800 },
  { file: '07-customer-signals.png', tab: TAB.signals, scroll: 800 },
  { file: '08-internal-product.png', tab: TAB.innovation, scroll: 0 },
  { file: '09-opportunity-scoring.png', tab: TAB.aiUpdates, scroll: 0 },
  { file: '10-roadmap-input.png', tab: TAB.recommendations, scroll: 0 },
  { file: '11-human-review.png', tab: TAB.digest, scroll: 0 },
  { file: '12-action-routing.png', tab: TAB.digest, scroll: 900 },
  { file: '13-leadership-briefing.png', tab: TAB.digest, scroll: 0 },
  { file: '14-decision-memory.png', tab: TAB.innovation, scroll: 500 },
  { file: '15-alerts.png', tab: TAB.analytics, scroll: 0, clipAutomation: true },
  { file: '16-impact-dashboard.png', tab: TAB.usage, scroll: 0 },
];

const FEATURE_VIDEOS = [
  { file: 'signal-ingestion.webm', tab: TAB.signals },
  { file: 'noise-filtering.webm', tab: TAB.analytics },
  { file: 'pattern-detection.webm', tab: TAB.analytics, scroll: 1500 },
  { file: 'opportunity-scoring.webm', tab: TAB.aiUpdates },
  { file: 'roadmap-input.webm', tab: TAB.recommendations },
  { file: 'human-review.webm', tab: TAB.digest },
  { file: 'action-routing.webm', tab: TAB.digest, scroll: 700 },
  { file: 'leadership-briefing.webm', tab: TAB.digest },
  { file: 'decision-memory.webm', tab: TAB.innovation },
];

const LIBRARY_VIDEOS = [
  { file: 'full-dashboard-walkthrough.webm', type: 'tour' },
  { file: 'signal-inbox-demo.webm', tab: TAB.signals },
  { file: 'noise-reduction-demo.webm', tab: TAB.analytics, scroll: 600 },
  { file: 'competitor-intelligence-demo.webm', tab: TAB.analytics, scroll: 1200 },
  { file: 'opportunity-scoring-demo.webm', tab: TAB.aiUpdates },
  { file: 'roadmap-input-demo.webm', tab: TAB.recommendations },
  { file: 'human-review-demo.webm', tab: TAB.digest },
  { file: 'leadership-briefing-demo.webm', tab: TAB.digest, fullPage: true },
];

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const AUTH_STATE = path.join(ROOT, '.auth-state.json');

async function login(page, context) {
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  if (await page.locator('.tab-bar').count()) {
    await sleep(600);
    return;
  }

  const apiLogin = await context.request.post(`${BASE_URL}/api/auth/login`, {
    data: { email: EMAIL, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  });
  if (!apiLogin.ok()) {
    throw new Error(`Login API failed: ${apiLogin.status()} ${await apiLogin.text()}`);
  }

  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForSelector('.tab-bar', { timeout: 45000 });
  await sleep(1000);
  await context.storageState({ path: AUTH_STATE });
}

async function clickTab(page, label) {
  const name = label.includes(' ') ? label.split(' ').slice(1).join(' ') : label;
  await page.locator('button.tab-btn').filter({ hasText: name }).first().click();
  await sleep(1200);
}

async function prepareView(page, { tab, scroll = 0, fullPage = false, clipAutomation = false }) {
  await clickTab(page, tab);
  if (clipAutomation) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(400);
  } else if (scroll > 0) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), scroll);
    await sleep(700);
  } else {
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(400);
  }
  return fullPage;
}

async function captureScreenshots(browser) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    ...(fs.existsSync(AUTH_STATE) ? { storageState: AUTH_STATE } : {}),
  });
  const page = await context.newPage();
  await login(page, context);
  await context.storageState({ path: AUTH_STATE });

  for (const shot of SCREENSHOTS) {
    const fullPage = await prepareView(page, shot);
    const out = path.join(SHOTS, shot.file);
    await page.screenshot({ path: out, fullPage: fullPage || false, type: 'png' });
    console.log('screenshot', shot.file);
  }

  await context.close();
}

async function transcodeMp4(webmPath) {
  const mp4Path = webmPath.replace(/\.webm$/i, '.mp4');
  execSync(
    `ffmpeg -y -i "${webmPath}" -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p -movflags +faststart -an "${mp4Path}"`,
    { stdio: 'pipe' },
  );
  console.log('mp4', path.basename(mp4Path));
}

async function recordClip(browser, outFile, steps, durationMs = 8000) {
  const tmpDir = path.join(VIDEO, '.tmp');
  fs.mkdirSync(tmpDir, { recursive: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: tmpDir, size: { width: 1440, height: 900 } },
    ...(fs.existsSync(AUTH_STATE) ? { storageState: AUTH_STATE } : {}),
  });
  const page = await context.newPage();
  await login(page, context);

  for (const step of steps) {
    if (step.tab) await prepareView(page, step);
    if (step.pause) await sleep(step.pause);
    if (step.scrollStep) {
      const max = step.scrollStep;
      for (let y = 0; y <= max; y += 250) {
        await page.evaluate((top) => window.scrollTo({ top, behavior: 'smooth' }), y);
        await sleep(350);
      }
    }
  }

  await sleep(Math.max(500, durationMs - 2000));
  const video = page.video();
  const dest = path.join(VIDEO, outFile);
  await page.close();
  await context.close();

  if (!video) throw new Error(`No video recorded for ${outFile}`);
  await video.saveAs(dest);
  console.log('video', outFile);
  try {
    await transcodeMp4(dest);
  } catch (err) {
    console.warn(`[capture] MP4 transcode skipped for ${outFile}:`, err instanceof Error ? err.message : err);
  }
}

async function recordFullTour(browser) {
  const tabs = Object.values(TAB);
  const steps = [];
  for (const tab of tabs) {
    steps.push({ tab, pause: 1200 });
    steps.push({ tab, scrollStep: 900, pause: 300 });
  }
  await recordClip(browser, 'full-dashboard-walkthrough.webm', steps, 55000);
}

async function main() {
  if (!EMAIL || !PASSWORD) {
    console.error('Set PULSARA_EMAIL and PULSARA_PASSWORD env vars');
    process.exit(1);
  }

  fs.mkdirSync(SHOTS, { recursive: true });
  fs.mkdirSync(VIDEO, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  try {
    if (process.env.SKIP_SCREENSHOTS !== '1') {
      await captureScreenshots(browser);
    }

    const forceVideos = new Set(
      (process.env.FORCE_VIDEOS || '').split(',').map((s) => s.trim()).filter(Boolean),
    );
    const existing = new Set(
      fs.existsSync(VIDEO) ? fs.readdirSync(VIDEO).filter((f) => f.endsWith('.webm')) : [],
    );
    const shouldRecord = (file) => forceVideos.has(file) || !existing.has(file);

    if (shouldRecord('full-dashboard-walkthrough.webm')) {
      await recordFullTour(browser);
    } else {
      console.log('skip existing full-dashboard-walkthrough.webm');
    }

    for (const feat of FEATURE_VIDEOS) {
      if (!shouldRecord(feat.file)) {
        console.log('skip existing', feat.file);
        continue;
      }
      await recordClip(
        browser,
        feat.file,
        [{ tab: feat.tab, scroll: feat.scroll || 0 }, { pause: 3500 }],
        7000,
      );
    }

    for (const lib of LIBRARY_VIDEOS) {
      if (lib.type === 'tour') continue;
      if (!shouldRecord(lib.file)) {
        console.log('skip existing', lib.file);
        continue;
      }
      await recordClip(
        browser,
        lib.file,
        [
          { tab: lib.tab, scroll: lib.scroll || 0 },
          { pause: lib.fullPage ? 5000 : 3500 },
          ...(lib.scroll ? [{ tab: lib.tab, scrollStep: lib.scroll + 800 }] : []),
        ],
        lib.fullPage ? 12000 : 8000,
      );
    }

    execSync(`node "${path.join(__dirname, 'transcode-all-videos.mjs')}"`, { stdio: 'inherit' });

    const manifest = {
      capturedAt: new Date().toISOString(),
      baseUrl: BASE_URL,
      screenshots: SCREENSHOTS.map((s) => s.file),
      videos: fs.readdirSync(VIDEO).filter((f) => f.endsWith('.webm') || f.endsWith('.mp4')),
    };
    fs.writeFileSync(path.join(ROOT, 'capture-log.json'), JSON.stringify(manifest, null, 2));
    console.log('Done.', manifest.videos.length, 'videos,', manifest.screenshots.length, 'screenshots');
  } finally {
    await browser.close();
    fs.rmSync(path.join(VIDEO, '.tmp'), { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
