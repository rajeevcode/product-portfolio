// Data-driven screenshot + video galleries for the Rescale OS case study.
// Runs BEFORE app.js so the [data-lightbox] buttons it injects exist when
// app.js binds the lightbox handlers.
//
// Every screen below is a REAL screen verified in apps/web (App.tsx routes +
// page components). No fabricated dashboards.

const SCREENSHOTS = [
  { n: "01", slug: "dashboard-overview", title: "Dashboard", desc: "Overview of task metrics, hunger scores, and sprint progress.", notice: "The operating-system landing surface.", tags: ["Dashboard"] },
  { n: "02", slug: "production-dashboard", title: "Production Dashboard", desc: "Multi-view sprint analytics — Overview, By Product, By Strategist, By Editor.", notice: "Velocity, revision leaderboard, NC-compliance.", tags: ["Dashboards"] },
  { n: "03", slug: "fulfillment-board", title: "Fulfillment Board", desc: "Three Kanban boards — Scripts, Videos, Images — with drag-and-drop.", notice: "The creative lifecycle, visualized.", tags: ["Creative Lifecycle"] },
  { n: "04", slug: "script-task-detail", title: "Script Task & Lifecycle", desc: "Parent script task moving through validated lifecycle statuses.", notice: "State machine with auto-promotion.", tags: ["Creative Lifecycle"] },
  { n: "05", slug: "child-task-hooks", title: "Hook / Image Child Tasks", desc: "Rule-generated _HK and _IMG children linked to a parent script.", notice: "VSL1-A_HK1 / STK1-B_IMG1 codes.", tags: ["Code Generation"] },
  { n: "06", slug: "my-tasks", title: "My Tasks", desc: "Personal task queue filtered by assignee.", notice: "Per-user view of in-flight work.", tags: ["Creative Lifecycle"] },
  { n: "07", slug: "ad-launcher-hub", title: "Ad Launcher Hub", desc: "Ready creatives with live status, ad category, and manual launch.", notice: "READY_FOR_LAUNCH auto-creates the ad.", tags: ["Ad Launcher"] },
  { n: "08", slug: "ad-launcher-live-status", title: "Live Status & Ad Category", desc: "gandalf_approval → new_test → live → paused → scheduled; category buttons.", notice: "Live status and category are independent.", tags: ["Ad Launcher"] },
  { n: "09", slug: "nptl-pipeline", title: "NPTL Pipeline", desc: "New Product Testing stages: research → validation → funnel → creative → launch.", notice: "Stage-based Kanban for new products.", tags: ["Pipeline"] },
  { n: "10", slug: "winner-lifecycle", title: "Winner Lifecycle", desc: "Dashboard, pre-learnings, learnings library, capacity planning, fulfillment.", notice: "Product scorecard and learnings.", tags: ["Winner Lifecycle"] },
  { n: "11", slug: "ops-center", title: "Ops Center", desc: "QA failures, bottlenecks, NC gaps, missing drive links, naming-convention events.", notice: "What needs attention, in-flow.", tags: ["Ops Center"] },
  { n: "12", slug: "ops-event-detail", title: "Ops Event Detail", desc: "Severity, coaching text, how-to-fix, expected vs actual value.", notice: "Actionable, not just alerting.", tags: ["Ops Center"] },
  { n: "13", slug: "german-translation", title: "AI German Translation", desc: "Script / ad-copy auto-translated (Claude → Gemini → LibreTranslate).", notice: "AI removes repetitive grunt work.", tags: ["AI"] },
  { n: "14", slug: "creative-analysis-job", title: "Creative Analysis Job", desc: "Gemini extracts 27 structured CR_* signals from a video; pollable job state.", notice: "Sync + async analysis jobs.", tags: ["AI"] },
  { n: "15", slug: "products-registry", title: "Products", desc: "Product registry and management.", notice: "Products that drive the pipeline.", tags: ["Products"] },
  { n: "16", slug: "settings-team", title: "Settings — Team & Roles", desc: "Team members, role keys, and Google Drive integration.", notice: "Roles: strategist, editor, launcher, admin…", tags: ["Settings"] },
  { n: "17", slug: "settings-integrations", title: "Settings — Integrations", desc: "Integration status (e.g. Google Drive) and connection state.", notice: "Connected / not-connected, sync status.", tags: ["Settings"] },
  { n: "18", slug: "calendar", title: "Calendar", desc: "Sprint calendar view.", notice: "Sprint cadence at a glance.", tags: ["Calendar"] },
  { n: "19", slug: "workspace-rls", title: "Workspace Isolation (RLS)", desc: "Fail-closed, workspace-scoped access (nptl / winner) with admin override.", notice: "Enforced at the database.", tags: ["Security"] },
  { n: "20", slug: "auth-signin", title: "Sign-in & Roles", desc: "Operator / admin authentication; admin-gated v2 API.", notice: "Role-scoped session.", tags: ["Auth"] },
  { n: "21", slug: "technical-architecture", title: "Technical Architecture", desc: "Monorepo: React control surface, Express API, PostgreSQL, AI providers, ops worker.", notice: "How the layers connect.", tags: ["Architecture"] },
  { n: "22", slug: "end-to-end-journey", title: "End-to-End Journey", desc: "Script → child generation → editing → launch → parent auto-promotion.", notice: "The full lifecycle, one flow.", tags: ["End-to-End"] },
];

// Unavailable recordings stay unpublished; keep their authored descriptions intact.
// Set available: true only after adding real recordings in both formats below.
const VIDEOS = [
  { file: "01-full-rescale-os-walkthrough", poster: "01-dashboard-overview", title: "Full Rescale OS Walkthrough", meta: "Top-to-bottom across the real screens" },
  { available: false, file: "02-creative-lifecycle-demo", poster: "03-fulfillment-board", title: "Creative Lifecycle Demo", meta: "Fulfillment boards → status flow" },
  { available: false, file: "03-script-to-child-flow-demo", poster: "05-child-task-hooks", title: "Script → Child Task Demo", meta: "Script Approved → rule-generated _HK/_IMG" },
  { available: false, file: "04-state-machine-auto-promotion-demo", poster: "04-script-task-detail", title: "Auto-Promotion Demo", meta: "Children launched → Learning → Done" },
  { available: false, file: "05-ad-launcher-demo", poster: "07-ad-launcher-hub", title: "Ad Launcher Demo", meta: "READY_FOR_LAUNCH → auto-created ad" },
  { available: false, file: "06-ops-center-demo", poster: "11-ops-center", title: "Ops Center Demo", meta: "QA / NC / bottleneck events" },
  { available: false, file: "07-nptl-pipeline-demo", poster: "09-nptl-pipeline", title: "NPTL Pipeline Demo", meta: "New-product testing stages" },
  { available: false, file: "08-winner-lifecycle-demo", poster: "10-winner-lifecycle", title: "Winner Lifecycle Demo", meta: "Scorecard + learnings library" },
  { available: false, file: "09-german-translation-demo", poster: "13-german-translation", title: "AI Translation Demo", meta: "Claude → Gemini → LibreTranslate" },
  { available: false, file: "10-creative-analysis-demo", poster: "14-creative-analysis-job", title: "Creative Analysis Demo", meta: "27 CR_* signals from video" },
  { available: false, file: "11-complete-end-to-end-journey", poster: "22-end-to-end-journey", title: "Complete End-to-End Journey", meta: "Script → launch → auto-promotion" },
];

function shotPath(slug, n) {
  return `assets/screenshots/${n}-${slug}.png`;
}

// If a real .png capture doesn't exist, fall back to the labeled .svg placeholder.
function shotFallback(slug, n) {
  return `assets/screenshots/${n}-${slug}.svg`;
}

(function buildGalleries() {
  const gallery = document.getElementById("screenshot-gallery");
  if (gallery) {
    gallery.innerHTML = SCREENSHOTS.map((s) => {
      const tags = s.tags.map((t) => `<span class="tag neutral">${t}</span>`).join("");
      return `
      <figure class="card shot-card" id="shot-${s.slug}">
        <img src="${shotPath(s.slug, s.n)}" alt="${s.title}" loading="lazy"
             onerror="this.onerror=null;this.src='${shotFallback(s.slug, s.n)}';" />
        <figcaption class="caption">
          <h3>${s.title}</h3>
          <p>${s.desc}</p>
          <p style="margin-top:0.5rem"><strong style="color:#cbd5e1">Notice:</strong> ${s.notice}</p>
          <div class="tag-row">${tags}</div>
          <button type="button" class="btn-text" data-lightbox>View full screenshot →</button>
        </figcaption>
      </figure>`;
    }).join("");
  }

  const videoGallery = document.getElementById("video-gallery");
  if (videoGallery) {
    videoGallery.innerHTML = VIDEOS.filter((v) => v.available !== false).map((v) => `
      <div class="card video-wrap video-card">
        <video controls preload="metadata" playsinline poster="assets/screenshots/${v.poster}.png"
               onerror="this.poster='assets/screenshots/${v.poster}.svg';">
          <source src="assets/video/${v.file}.mp4" type="video/mp4" />
          <source src="assets/video/${v.file}.webm" type="video/webm" />
          <a href="assets/video/${v.file}.mp4">Video — ${v.file}.mp4</a>
        </video>
        <div class="video-meta">
          <span><strong style="color:#f8fafc">${v.title}</strong><br>${v.meta}</span>
          <span class="duration-pill">DEMO</span>
        </div>
      </div>`).join("");
  }
})();
