#!/usr/bin/env node
/**
 * Generates Pulsara portfolio index.html from structured section data.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const OUT = path.join(__dirname, 'index.html');
const PORTFOLIO_BASE = process.env.PORTFOLIO_BASE
  ? process.env.PORTFOLIO_BASE.replace(/\/?$/, '/')
  : '';

function asset(relativePath) {
  return `${PORTFOLIO_BASE}${relativePath}`;
}

const screenshots = [
  { id: 'executive-overview', file: '01-executive-overview.png', title: 'Executive Overview Dashboard', caption: 'High-level view of signal volume, opportunity themes, competitor moves, urgent alerts, and roadmap impact.', tags: ['Analytics', 'KPIs', 'Clusters', 'Automation status'] },
  { id: 'signal-inbox', file: '02-signal-inbox.png', title: 'Signal Inbox', caption: 'Centralized inbox for competitor, market, customer, campaign, and internal product signals — categorized by source, priority, owner, and status.', tags: ['Signals feed', 'Revenue badges', 'Source tags', 'Freshness'] },
  { id: 'noise-reduction', file: '03-noise-reduction.png', title: 'Noise Reduction Dashboard', caption: 'Shows raw signals versus filtered signals, duplicate removal, low-value signal suppression, and final action-worthy signals.', tags: ['Quality gate', 'Deduplication', 'Blocklist', 'Freshness bands'] },
  { id: 'priority-queue', file: '04-priority-queue.png', title: 'Priority Queue', caption: 'Ranks signals by business impact, urgency, confidence, customer value, competitive relevance, and strategic fit.', tags: ['EXECUTE', 'TEST', 'EXPLORE', 'Revenue scoring'] },
  { id: 'competitor-intelligence', file: '05-competitor-intelligence.png', title: 'Competitor Intelligence View', caption: 'Tracks competitor launches, pricing changes, AI features, positioning shifts, landing page messaging, and ad creative patterns.', tags: ['Cluster trends', 'Cross-source', 'Momentum', 'Watchlist'] },
  { id: 'market-trends', file: '06-market-trends.png', title: 'Market & Innovation Trends View', caption: 'Detects emerging AI use cases, workflow automation patterns, agentic product experiences, tooling trends, and customer behavior shifts.', tags: ['Trend velocity', 'Emerging patterns', 'Innovation clusters', 'Source diversity'] },
  { id: 'customer-signals', file: '07-customer-signals.png', title: 'Customer & Business Signals View', caption: 'Groups customer pain points, support themes, sales objections, product feedback, conversion issues, and operational bottlenecks.', tags: ['Business relevance', 'Campaign signals', 'Conversion', 'Operations'] },
  { id: 'internal-product', file: '08-internal-product.png', title: 'Internal Product Signals View', caption: 'Tracks feature requests, experiment results, dashboard anomalies, roadmap dependencies, delivery risks, and adoption gaps.', tags: ['Innovation tab', 'Creative intel', 'Enrichment', 'Integration status'] },
  { id: 'opportunity-scoring', file: '09-opportunity-scoring.png', title: 'Opportunity Scoring View', caption: 'Scores opportunities based on impact, urgency, confidence, effort, competitive relevance, and strategic fit.', tags: ['Signal score', 'Revenue impact', 'Confidence', 'Effort'] },
  { id: 'roadmap-input', file: '10-roadmap-input.png', title: 'Roadmap Input Board', caption: 'Converts high-priority signals into product opportunities, experiments, backlog items, and leadership review topics.', tags: ['Action items', 'AI Brief', 'Recommendations', 'Experiments'] },
  { id: 'human-review', file: '11-human-review.png', title: 'Human Review Queue', caption: 'Allows teams to validate, reject, approve, or route AI-prioritized signals before business action.', tags: ['HITL', 'Themed sections', 'Priority actions', 'Review flow'] },
  { id: 'action-routing', file: '12-action-routing.png', title: 'Action Routing Board', caption: 'Routes approved signals to product, growth, creative, media buying, BI, operations, engineering, or leadership.', tags: ['Action items', 'Categories', 'Derived signals', 'Routing'] },
  { id: 'leadership-briefing', file: '13-leadership-briefing.png', title: 'Leadership Briefing View', caption: 'Weekly innovation signal brief summarizing competitor activity, emerging trends, internal opportunities, and recommended actions.', tags: ['AI Brief', 'Top signals', 'Emerging trends', 'Discord delivery'] },
  { id: 'decision-memory', file: '14-decision-memory.png', title: 'Decision Memory View', caption: 'Maintains a history of signals, decisions, actions, outcomes, and learnings.', tags: ['Innovation memory', 'Search', 'Embeddings', 'Audit trail'] },
  { id: 'alerts', file: '15-alerts.png', title: 'Alerts & Notifications View', caption: 'Shows urgent competitor moves, campaign anomalies, roadmap risks, and opportunity alerts.', tags: ['Automation warnings', 'Delivery status', 'Scrape health', 'Urgent flags'] },
  { id: 'impact-dashboard', file: '16-impact-dashboard.png', title: 'Impact Dashboard', caption: 'Shows business impact metrics including 2,000+ signals/day, 70% noise reduction, 2–3× throughput, and 40% coordination reduction.', tags: ['AI Usage', 'Budget guardrails', 'Token limits', 'Cost tracking'] },
];

const VIDEO_DIR = asset('assets/video');
const VIDEO_ROOT = path.join(__dirname, 'assets', 'video');

const features = [
  { name: 'Signal Ingestion', desc: 'Brings together competitor, market, customer, campaign, and internal product signals into one structured intelligence layer.', videoFile: 'signal-ingestion.webm', action: 'Run scrape pipeline and review categorized inbox', img: '02-signal-inbox.png' },
  { name: 'Noise Filtering', desc: 'Removes repeated, low-quality, irrelevant, or non-actionable signals so teams are not overwhelmed.', videoFile: 'noise-filtering.webm', action: 'Compare raw vs filtered signal counts', img: '03-noise-reduction.png' },
  { name: 'AI Pattern Detection', desc: 'Identifies recurring themes, emerging trends, competitor moves, customer pain points, and product opportunities.', videoFile: 'pattern-detection.webm', action: 'Inspect cluster trends and momentum labels', img: '06-market-trends.png' },
  { name: 'Opportunity Prioritization', desc: 'Scores signals based on business impact, urgency, customer value, competitive relevance, effort, confidence, and strategic fit.', videoFile: 'opportunity-scoring.webm', action: 'Sort priority queue by revenue tier', img: '09-opportunity-scoring.png' },
  { name: 'Roadmap Input Generation', desc: 'Turns high-priority signals into product opportunities, experiments, backlog items, or leadership review topics.', videoFile: 'roadmap-input.webm', action: 'Promote signals to roadmap board items', img: '10-roadmap-input.png' },
  { name: 'Human Review', desc: 'Keeps teams in control by requiring human validation before signals become roadmap or business actions.', videoFile: 'human-review.webm', action: 'Approve, reject, or route in review queue', img: '11-human-review.png' },
  { name: 'Action Routing', desc: 'Sends approved signals to the right owner across product, growth, creative, media buying, operations, BI, engineering, or leadership.', videoFile: 'action-routing.webm', action: 'Assign owner and delivery channel', img: '12-action-routing.png' },
  { name: 'Leadership Briefing', desc: 'Generates a weekly innovation signal brief for leadership review.', videoFile: 'leadership-briefing.webm', action: 'Generate AI Brief and review top signals', img: '13-leadership-briefing.png' },
  { name: 'Decision Memory', desc: 'Creates a record of signals, decisions, outcomes, and learnings so the organization gets smarter over time.', videoFile: 'decision-memory.webm', action: 'Search past signals and decisions', img: '14-decision-memory.png' },
];

const videos = [
  { title: 'Full Dashboard Walkthrough', desc: 'Top-to-bottom dashboard walkthrough covering all sections and sub-sections.', duration: '~45s', videoFile: 'full-dashboard-walkthrough.webm', poster: '01-executive-overview.png' },
  { title: 'Signal Inbox Demo', desc: 'How signals enter the system and get categorized.', duration: '~8s', videoFile: 'signal-inbox-demo.webm', poster: '02-signal-inbox.png' },
  { title: 'Noise Reduction Demo', desc: 'How raw signals are filtered into action-worthy signals.', duration: '~8s', videoFile: 'noise-reduction-demo.webm', poster: '03-noise-reduction.png' },
  { title: 'Competitor Intelligence Demo', desc: 'How competitor moves become roadmap opportunities.', duration: '~8s', videoFile: 'competitor-intelligence-demo.webm', poster: '05-competitor-intelligence.png' },
  { title: 'Opportunity Scoring Demo', desc: 'How signals are scored and prioritized.', duration: '~8s', videoFile: 'opportunity-scoring-demo.webm', poster: '09-opportunity-scoring.png' },
  { title: 'Roadmap Input Demo', desc: 'How approved signals become experiments, backlog items, or leadership review topics.', duration: '~8s', videoFile: 'roadmap-input-demo.webm', poster: '10-roadmap-input.png' },
  { title: 'Human Review Demo', desc: 'How teams validate AI-prioritized recommendations.', duration: '~8s', videoFile: 'human-review-demo.webm', poster: '11-human-review.png' },
  { title: 'Leadership Briefing Demo', desc: 'How the system creates weekly innovation briefs.', duration: '~12s', videoFile: 'leadership-briefing-demo.webm', poster: '13-leadership-briefing.png' },
];

function videoSourceTags(webmFile) {
  const base = webmFile.replace(/\.webm$/i, '');
  const mp4File = `${base}.mp4`;
  const mp4Disk = path.join(VIDEO_ROOT, `${base}.mp4`);
  const webmSrc = `${VIDEO_DIR}/${webmFile}`;
  const mp4Src = `${VIDEO_DIR}/${mp4File}`;
  const parts = [];
  if (fs.existsSync(mp4Disk)) {
    parts.push(`<source src="${mp4Src}" type="video/mp4" />`);
  }
  parts.push(`<source src="${webmSrc}" type="video/webm" />`);
  return parts.join('\n                  ');
}

function videoPlayer(webmFile, poster, extraClass = '') {
  const frameClass = ['media-frame', 'media-frame--video', extraClass].filter(Boolean).join(' ');
  return `<div class="${frameClass}">
                <video controls preload="metadata" playsinline poster="${poster}">
                  ${videoSourceTags(webmFile)}
                </video>
              </div>`;
}

function videoHtml(file, posterFile, label) {
  const poster = posterFile ? asset(`assets/screenshots/${posterFile}`) : asset('assets/screenshots/01-executive-overview.png');
  return `<div class="card video-wrap">
              ${label ? `<p class="demo-label" style="padding:1rem 1.15rem 0">${label}</p>` : ''}
              ${videoPlayer(file, poster, 'media-frame--hero')}
            </div>`;
}

function tagsHtml(tags) {
  return `<div class="tag-row">${tags.map((t) => `<span class="tag neutral">${t}</span>`).join('')}</div>`;
}

function shotCard(s, prefix = asset('assets/screenshots')) {
  return `<figure class="card shot-card" id="${s.id}">
              <img src="${prefix}/${s.file}" alt="${s.title}" loading="lazy" />
              <figcaption class="caption">
                <h3>${s.title}</h3>
                <p>${s.caption}</p>
                ${tagsHtml(s.tags)}
                <button type="button" class="btn-text" data-lightbox>View full screenshot →</button>
              </figcaption>
            </figure>`;
}

function featureCard(f) {
  const poster = asset(`assets/screenshots/${f.img}`);
  return `<article class="card feature-walk-card">
              <div class="split-media">
                <div class="media-frame media-frame--scroll" tabindex="0" aria-label="${f.name} screenshot preview — scroll for more">
                  <img src="${poster}" alt="${f.name} screenshot" loading="lazy" />
                </div>
                ${videoPlayer(f.videoFile, poster)}
              </div>
              <div class="feature-walk-body">
                <h3>${f.name}</h3>
                <p>${f.desc}</p>
                <div class="action-label">Key action: ${f.action}</div>
              </div>
            </article>`;
}

function videoCard(v) {
  const poster = asset(`assets/screenshots/${v.poster}`);
  return `<article class="card video-card">
              ${videoPlayer(v.videoFile, poster, 'media-frame--library')}
              <div class="video-meta">
                <div>
                  <h3 style="margin:0 0 0.25rem;font-size:1rem">${v.title}</h3>
                  <p style="margin:0;color:var(--text-muted);font-size:0.9rem">${v.desc}</p>
                </div>
                <span class="duration-pill">${v.duration}</span>
              </div>
            </article>`;
}

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    ${PORTFOLIO_BASE ? `<base href="${PORTFOLIO_BASE}" />` : ''}
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Pulsara — AI Innovation Signal Intelligence System</title>
    <meta name="description" content="Product portfolio: AI-powered signal intelligence that ingests competitor, market, customer, and campaign signals — filters noise, detects patterns, and converts insights into roadmap actions." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="${asset('assets/styles.css')}" />
  </head>
  <body>
    <header class="site-header">
      <div class="container inner">
        <a class="brand" href="#" data-portfolio-home>Rajeev <span>Kumar</span></a>
        <nav class="nav nav-compact" aria-label="Primary">
          <a href="#snapshot">Snapshot</a>
          <a href="#full-video">Walkthrough</a>
          <a href="#screenshots">Screenshots</a>
          <a href="#features">Features</a>
          <a href="#impact">Impact</a>
          <a href="#video-library">Videos</a>
          <a href="#contact" class="nav-contact">Contact</a>
        </nav>
      </div>
    </header>

    <main>
      <section class="hero compact hero-indigo" id="top">
        <div class="container">
          <p class="eyebrow">Product portfolio case study</p>
          <h1>Pulsara</h1>
          <p class="featured-subtitle hero-subtitle">AI Innovation Signal Intelligence System</p>
          <p class="lead">
            An AI-powered signal intelligence layer that processes competitor, market, customer, campaign, and internal product signals,
            filters noise, detects patterns, prioritizes opportunities, and converts innovation signals into roadmap inputs, experiments,
            alerts, and team actions.
          </p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="#full-video" data-scroll>Watch Full Dashboard Walkthrough</a>
            <a class="btn btn-secondary" href="#screenshots" data-scroll>View Screenshots</a>
            <a class="btn btn-secondary" href="#features" data-scroll>Explore Features</a>
            <a class="btn btn-secondary" href="#solution" data-scroll>View Roadmap Intelligence Flow</a>
          </div>
        </div>
      </section>

      <section class="section alt" id="snapshot">
        <div class="container">
          <h2 class="section-title">Project snapshot</h2>
          <div class="card pad">
            <dl class="snapshot-grid">
              <div class="snapshot-item"><dt>Role</dt><dd>AI Product &amp; Automation Builder</dd></div>
              <div class="snapshot-item"><dt>Domain</dt><dd>AI signal intelligence, competitive intelligence, product discovery, roadmap strategy</dd></div>
              <div class="snapshot-item"><dt>Users</dt><dd>Product teams, growth teams, creative teams, media buyers, operations, leadership</dd></div>
              <div class="snapshot-item"><dt>System type</dt><dd>AI innovation signal intelligence platform</dd></div>
              <div class="snapshot-item"><dt>Status</dt><dd>Production workflow / internal AI system</dd></div>
              <div class="snapshot-item snapshot-wide">
                <dt>Tools</dt>
                <dd class="snapshot-stack">
                  <span><strong>AI workflows:</strong> OpenRouter tiered routing (triage, enrichment, digest, scoring), agent-impact analysis, innovation recommendations, creative scoring, revenue-impact heuristics, founder-style gating</span>
                  <span><strong>Data:</strong> SQLite / Postgres (<code>ops.db</code>, <code>innovation.db</code>), local signal store, innovation memory search, report delivery log, source registry, AI Updates registry</span>
                  <span><strong>External ingestion:</strong> X/Twitter via Nitter RSS (72+ curated accounts), Reddit JSON API (30+ subreddits), Google News RSS (60+ queries), LinkedIn Pulse via Google News, 20+ industry blog RSS feeds, YouTube channel RSS (+ optional YouTube Data API stats), 33+ MarTech tool news queries, AI platform RSS (Anthropic, OpenAI, Google Gemini, LangChain)</span>
                  <span><strong>Internal ingestion:</strong> Discord #innovations channel sync, innovation account registry scrape, authenticated site scraper (<code>AUTH_SITES</code>), manual operator inputs via dashboard</span>
                  <span><strong>Integrations &amp; delivery:</strong> Google Sheets signal export, Discord webhooks (daily digest + innovation alerts), Telegram bot delivery, competitor watchlist / expansion seeds — action routing to product, growth, creative, media buying, BI, ops, leadership (ClickUp-ready)</span>
                  <span><strong>Ops:</strong> Scheduled scrape pipeline (8h cycle), dashboards, business rules &amp; noise filters, human review workflows, cluster feedback, $1/day AI budget guardrails</span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section class="section dark-showcase" id="full-video">
        <div class="container">
          <h2 class="section-title">Full Dashboard Walkthrough</h2>
          <p class="section-intro">
            A top-to-bottom walkthrough of the Pulsara dashboard covering signal ingestion, noise reduction, prioritization,
            competitor intelligence, roadmap opportunities, alerts, and leadership summaries.
          </p>
          ${videoHtml('full-dashboard-walkthrough.webm', '01-executive-overview.png', 'Recorded from localhost:3000 — all dashboard tabs')}
            <div class="video-meta" style="padding:1rem 1.15rem;border-top:1px solid #334155;color:#94a3b8;font-size:0.9rem">
              Analytics → Signals → AI Brief → Creative Intel → Innovation → AI Updates → Recommendations → AI Usage
            </div>
          <div class="tag-row" style="margin-top:1rem">
            <span class="tag">Full dashboard</span>
            <span class="tag">Top-to-bottom scroll</span>
            <span class="tag">All sections and sub-sections</span>
            <span class="tag">Product walkthrough</span>
          </div>
        </div>
      </section>

      <section class="section" id="problem">
        <div class="container">
          <h2 class="section-title">The Problem: Too Many Signals, Not Enough Clarity</h2>
          <div class="prose">
            <p>
              Product, marketing, and leadership teams are surrounded by scattered signals from competitors, market trends,
              customer feedback, campaign data, internal dashboards, sales conversations, AI tool announcements, and operational issues.
            </p>
            <p>
              The problem is not lack of information. The problem is knowing which signals matter and which should influence roadmap decisions.
            </p>
          </div>
          <div class="pain-grid">
            ${[
              ['Scattered competitor intelligence', 'Intel lives across tabs, Slack, and ad libraries with no shared scoring.'],
              ['Noisy campaign and creative signals', 'Performance noise drowns out strategic creative and positioning shifts.'],
              ['Slow roadmap discovery', 'Teams manually synthesize trends instead of converting signals into backlog inputs.'],
              ['Manual trend tracking', 'Emerging AI and automation patterns require constant manual monitoring.'],
              ['Limited signal prioritization', 'Everything feels urgent — nothing is ranked by impact, confidence, or effort.'],
              ['Weak signal → experiment link', 'Market signals rarely become structured experiments or tests.'],
              ['Too much manual coordination', 'Product, creative, growth, and ops chase updates in parallel threads.'],
              ['No decision memory', 'Past signals, decisions, and outcomes are lost after the weekly review.'],
            ].map(([h, p]) => `<article class="pain-card"><h3>${h}</h3><p>${p}</p></article>`).join('\n            ')}
          </div>
        </div>
      </section>

      <section class="section alt" id="solution">
        <div class="container">
          <h2 class="section-title">The Solution: AI Signal Intelligence for Roadmap Decisions</h2>
          <div class="prose">
            <p>
              Pulsara ingests external and internal signals, filters noise, detects patterns, prioritizes opportunities, and converts
              important innovation signals into roadmap inputs, experiments, alerts, and team actions.
            </p>
          </div>
          <div class="card flow" style="margin-top:1.75rem">
            ${[
              'Market / Competitor / Customer / Campaign / Product Signals',
              'Signal Ingestion',
              'Noise Filtering + Deduplication',
              'AI Trend & Pattern Detection',
              'Opportunity Prioritization',
              'Human Review + Strategic Decisioning',
              'Internal Roadmap / Experiments / Alerts / Team Actions',
            ].map((step, i) => `${i > 0 ? '<div class="flow-arrow" aria-hidden="true">↓</div>' : ''}
            <div class="flow-step"><div class="flow-num">${i + 1}</div><div><strong>${step}</strong></div></div>`).join('')}
          </div>
        </div>
      </section>

      <section class="section" id="screenshots">
        <div class="container">
          <h2 class="section-title">Dashboard Screenshots</h2>
          <p class="section-intro">
            Real captures from the shipped Pulsara dashboard — signal ingestion through AI briefs, creative intel, innovation scoring,
            recommendations, and cost guardrails. Each card maps to a product surface in the live system.
          </p>
          <div class="gallery">
            ${screenshots.map((s) => shotCard(s)).join('\n            ')}
          </div>
        </div>
      </section>

      <section class="section alt" id="features">
        <div class="container">
          <h2 class="section-title">Feature Walkthroughs</h2>
          <p class="section-intro">Module-by-module product flows — screenshot proof plus short demo placeholders for Loom embeds.</p>
          <div class="gallery">
            ${features.map((f) => featureCard(f)).join('\n            ')}
          </div>
        </div>
      </section>

      <section class="section" id="signal-sources">
        <div class="container">
          <h2 class="section-title">Signal Sources</h2>
          <p class="section-intro">Four intelligence layers ingested, scored, and routed through one signal taxonomy.</p>

          <div class="signal-group">
            <h3>A. Competitor Signals</h3>
            <div class="signal-items">
              ${['New product launches','New AI features','Pricing changes','Landing page messaging','Ad creative patterns','Market expansion moves','Positioning changes','Partnership announcements'].map((x)=>`<div class="signal-item">${x}</div>`).join('')}
            </div>
            <figure class="card shot-card" style="margin-top:1rem">
              <img src="${asset('assets/screenshots/05-competitor-intelligence.png')}" alt="Competitor intelligence clusters" loading="lazy" />
            </figure>
          </div>

          <div class="signal-group">
            <h3>B. Market &amp; Innovation Signals</h3>
            <div class="signal-items">
              ${['Emerging AI use cases','New workflow automation patterns','Agentic product experiences','Tooling and platform trends','Customer behavior shifts','Industry benchmarks','Regulatory or compliance changes'].map((x)=>`<div class="signal-item">${x}</div>`).join('')}
            </div>
            <figure class="card shot-card" style="margin-top:1rem">
              <img src="${asset('assets/screenshots/06-market-trends.png')}" alt="Market and innovation trend clusters" loading="lazy" />
            </figure>
          </div>

          <div class="signal-group">
            <h3>C. Customer &amp; Business Signals</h3>
            <div class="signal-items">
              ${['Customer pain points','Support themes','Sales objections','Product feedback','Campaign performance signals','Conversion issues','Retention or churn patterns','Operational bottlenecks'].map((x)=>`<div class="signal-item">${x}</div>`).join('')}
            </div>
            <figure class="card shot-card" style="margin-top:1rem">
              <img src="${asset('assets/screenshots/07-customer-signals.png')}" alt="Customer and business signals feed" loading="lazy" />
            </figure>
          </div>

          <div class="signal-group">
            <h3>D. Internal Product Signals</h3>
            <div class="signal-items">
              ${['Feature requests','Experiment results','Dashboard anomalies','Roadmap dependencies','Delivery risks','Adoption gaps','Workflow inefficiencies'].map((x)=>`<div class="signal-item">${x}</div>`).join('')}
            </div>
            <figure class="card shot-card" style="margin-top:1rem">
              <img src="${asset('assets/screenshots/08-internal-product.png')}" alt="Internal product and creative signals" loading="lazy" />
            </figure>
          </div>
        </div>
      </section>

      <section class="section alt" id="use-cases">
        <div class="container">
          <h2 class="section-title">Use Cases</h2>
          <div class="grid-3">
            ${[
              ['Competitor Intelligence','Tracks competitor launches, messaging changes, pricing shifts, ad patterns, and AI feature moves.'],
              ['Roadmap Planning','Converts repeated market, customer, and competitor signals into opportunity themes for roadmap planning.'],
              ['AI Product Discovery','Identifies emerging AI workflow patterns and suggests where similar automation or agentic capabilities could be useful internally.'],
              ['Creative Strategy','Detects creative angles, messaging patterns, and competitor ad patterns that can become testable creative ideas.'],
              ['Growth Experiments','Surfaces signals that can become experiments across landing pages, funnels, campaigns, pricing, messaging, or onboarding.'],
              ['Leadership Briefing','Creates a weekly innovation signal brief summarizing competitor activity, emerging trends, internal opportunities, and recommended actions.'],
            ].map(([h,p])=>`<article class="card pad"><h3>${h}</h3><p>${p}</p></article>`).join('\n            ')}
          </div>
        </div>
      </section>

      <section class="impact-strip" id="impact">
        <div class="container impact-strip-grid">
          <div class="impact-stat"><span class="impact-value">2,000+</span><span class="impact-label">signals / day processed</span></div>
          <div class="impact-stat"><span class="impact-value">70%</span><span class="impact-label">noise reduction</span></div>
          <div class="impact-stat"><span class="impact-value">2–3×</span><span class="impact-label">creative &amp; strategic throughput</span></div>
          <div class="impact-stat"><span class="impact-value">40%</span><span class="impact-label">coordination reduction</span></div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="metric-grid">
            ${['Faster roadmap input generation','Better competitor and market visibility','Improved cross-team decision-making','Stronger decision memory'].map((l)=>`<article class="card metric-card"><div class="value">↑</div><div class="label">${l}</div></article>`).join('\n            ')}
          </div>
        </div>
      </section>

      <section class="section alt" id="my-role">
        <div class="container">
          <h2 class="section-title">My Role</h2>
          <div class="card role-box">
            <p>I designed Pulsara as an AI signal intelligence layer that connects external innovation signals with internal product and business decision-making.</p>
            <p style="margin-top:1rem"><strong>My work included:</strong></p>
            <ul style="margin:0.75rem 0 0;padding-left:1.1rem;color:var(--text-muted);line-height:1.65">
              <li>Defining the signal intelligence workflow</li>
              <li>Creating the signal taxonomy across competitor, market, customer, campaign, and internal product signals</li>
              <li>Designing noise filtering and deduplication logic</li>
              <li>Defining opportunity scoring and prioritization criteria</li>
              <li>Translating signals into roadmap inputs, experiments, alerts, and team actions</li>
              <li>Designing dashboard requirements for product, creative, growth, and leadership users</li>
              <li>Creating human-in-the-loop review flows</li>
              <li>Aligning product, creative, media buying, BI, operations, and leadership stakeholders</li>
              <li>Connecting AI signal intelligence to roadmap planning and business execution</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="section" id="technical">
        <div class="container">
          <h2 class="section-title">Technical Breakdown</h2>
          <div class="grid-3">
            ${[
              ['A. Data Inputs','X/Twitter (Nitter), Reddit, Google News, LinkedIn Pulse, blog RSS, YouTube, MarTech tool news, AI Updates RSS, Discord innovations, innovation registry accounts, authenticated sites, operator dashboard feedback.'],
              ['B. Signal Taxonomy','Competitor, market, customer, campaign, product, operational, roadmap, and leadership signals.'],
              ['C. Noise Filtering','Deduplication, low-value signal removal, repeated alert suppression, confidence checks, and relevance scoring.'],
              ['D. Pattern Detection','Theme clustering, competitor movement detection, recurring customer pain points, trend identification, and anomaly detection.'],
              ['E. Opportunity Scoring','Impact, urgency, customer value, confidence, effort, competitive relevance, and strategic fit.'],
              ['F. Human Review','Approve, reject, route, convert to experiment, convert to roadmap input, escalate, or archive.'],
              ['G. Action Routing','Product, growth, creative, media buying, BI, operations, engineering, leadership.'],
              ['H. Dashboard Outputs','Signal inbox, priority queue, competitor intelligence, innovation trends, roadmap board, leadership brief, alerts, and decision memory.'],
            ].map(([h,p])=>`<article class="card pad"><h3>${h}</h3><p>${p}</p></article>`).join('\n            ')}
          </div>
        </div>
      </section>

      <section class="section alt" id="video-library">
        <div class="container">
          <h2 class="section-title">Video Library</h2>
          <p class="section-intro">Dedicated walkthrough recordings captured from the live Pulsara dashboard at <code>localhost:3000</code>.</p>
          <div class="video-library-grid">
            ${videos.map((v) => videoCard(v)).join('\n            ')}
          </div>
        </div>
      </section>

      <section class="section contact-cta" id="contact">
        <div class="container">
          <div class="card pad contact-card">
            <h2>Want to see how I turn noisy signals into AI-powered roadmap intelligence?</h2>
            <p>
              Pulsara shows how AI can connect market awareness, competitor intelligence, product discovery, and internal execution into one decision system.
            </p>
            <div class="hero-actions">
              <a class="btn btn-primary" data-contact="email" href="mailto:rajeevkmba2025@gmail.com">Contact Rajeev</a>
              <a class="btn btn-secondary" data-rescale-case-study href="#">View Creative Marketing Agents / Rescale Operator</a>
              <a class="btn btn-secondary" data-portfolio-home href="#">Back to Portfolio</a>
            </div>
            <div class="contact-links">
              <a data-contact="email" href="mailto:rajeevkmba2025@gmail.com">Email</a>
              <a data-contact="linkedin" href="https://www.linkedin.com/in/rajeevkumar9/" target="_blank" rel="noopener">LinkedIn</a>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="container inner">
        <span>Pulsara — AI Innovation Signal Intelligence System</span>
        <div class="footer-links">
          <span>Built by Rajeev Kumar for Rescale</span>
          <a data-portfolio-home href="#">Portfolio home</a>
        </div>
      </div>
    </footer>

    <div class="lightbox" id="lightbox" hidden>
      <button type="button" class="lightbox-close" data-close-lightbox aria-label="Close">×</button>
      <div class="lightbox-inner">
        <img id="lightbox-img" src="" alt="" />
        <div class="lightbox-caption" id="lightbox-caption"></div>
      </div>
    </div>

    <script src="${asset('assets/site-config.js')}"></script>
    <script>
      if (window.SITE) {
        document.querySelectorAll('[data-portfolio-home]').forEach((a) => {
          a.href = window.SITE.portfolioHome;
        });
        document.querySelectorAll('[data-rescale-case-study]').forEach((a) => {
          a.href = window.SITE.rescaleOperatorCaseStudy;
        });
      }
    </script>
    <script src="${asset('assets/contact.js')}"></script>
    <script src="${asset('assets/app.js')}"></script>
  </body>
</html>`;

fs.writeFileSync(OUT, html);
console.log('Wrote', OUT);
