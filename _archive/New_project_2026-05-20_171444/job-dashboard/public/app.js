const els = {
  list: document.getElementById("list"),
  q: document.getElementById("q"),
  status: document.getElementById("status"),
  hideApplied: document.getElementById("hideApplied"),
  usCnOnly: document.getElementById("usCnOnly"),
  sort: document.getElementById("sort"),
  meta: document.getElementById("meta"),
  btnRefresh: document.getElementById("btnRefresh"),
  btnImport: document.getElementById("btnImport"),
  btnExportInbox: document.getElementById("btnExportInbox"),
  btnExportAll: document.getElementById("btnExportAll"),
  btnCopyApplied: document.getElementById("btnCopyApplied"),
  btnCopyBlocked: document.getElementById("btnCopyBlocked"),
  btnQuick: document.getElementById("btnQuick"),
  btnAdd: document.getElementById("btnAdd"),
  dlgImport: document.getElementById("dlgImport"),
  importText: document.getElementById("importText"),
  btnDoImport: document.getElementById("btnDoImport"),
  dlgQuick: document.getElementById("dlgQuick"),
  quickForm: document.getElementById("quickForm"),
  qLink: document.getElementById("qLink"),
  qCompany: document.getElementById("qCompany"),
  qTitle: document.getElementById("qTitle"),
  qNotes: document.getElementById("qNotes"),
  dlgAdd: document.getElementById("dlgAdd"),
  addForm: document.getElementById("addForm"),
  fCompany: document.getElementById("fCompany"),
  fTitle: document.getElementById("fTitle"),
  fLocation: document.getElementById("fLocation"),
  fLink: document.getElementById("fLink"),
  fFound: document.getElementById("fFound"),
  fFit: document.getElementById("fFit"),
  fComp: document.getElementById("fComp"),
  fVerif: document.getElementById("fVerif"),
  fSyn: document.getElementById("fSyn"),
  fWhy: document.getElementById("fWhy"),
  fConc: document.getElementById("fConc"),
  fKeys: document.getElementById("fKeys"),
};

let allJobs = [];

const STORAGE_KEY = "job_dashboard_db_v1";
const FEED_KEY = "__JOB_FEED__";
const BLOCKED_KEY = "job_dashboard_blocked_links_v1";
let lastSyncedAt = "";
let storageOk = true;
let memDb = { schema: 1, jobs: [] };
let memBlocked = [];

function loadDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { schema: 1, jobs: [] };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { schema: 1, jobs: [] };
    if (!Array.isArray(parsed.jobs)) parsed.jobs = [];
    if (!parsed.schema) parsed.schema = 1;
    return parsed;
  } catch {
    storageOk = false;
    return memDb;
  }
}

function saveDb(db) {
  db.lastSavedAt = new Date().toISOString();
  memDb = db;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    storageOk = true;
  } catch {
    storageOk = false;
  }
}

function loadBlocked() {
  try {
    const raw = localStorage.getItem(BLOCKED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((s) => String(s).trim()).filter(Boolean);
  } catch {
    return memBlocked;
  }
}

function saveBlocked(list) {
  memBlocked = list;
  try {
    localStorage.setItem(BLOCKED_KEY, JSON.stringify(list));
  } catch {
    // ignore (file:// webviews may block)
  }
}

function normLink(link) {
  return String(link || "").trim().toLowerCase();
}

function isBlockedLink(link) {
  const l = normLink(link);
  if (!l) return false;
  return loadBlocked().includes(l);
}

function blockLink(link) {
  const l = normLink(link);
  if (!l) return;
  const list = loadBlocked();
  if (list.includes(l)) return;
  list.unshift(l);
  saveBlocked(list);
}

function newId() {
  return `job_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function stableId(input) {
  const key = String(input || "");
  let h = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `job_${(h >>> 0).toString(36)}`;
}

function normalizeJob(input) {
  const trimmed = (v) => (typeof v === "string" ? v.trim() : v);
  const keyForId = String(input.link || "")
    ? String(input.link || "").trim().toLowerCase()
    : `${String(input.company || "").trim().toLowerCase()}::${String(input.title || "").trim().toLowerCase()}`;
  const out = {
    id: input.id && String(input.id) ? String(input.id) : stableId(keyForId) || newId(),
    company: trimmed(input.company || ""),
    title: trimmed(input.title || ""),
    location: trimmed(input.location || ""),
    link: trimmed(input.link || ""),
    synopsis: trimmed(input.synopsis || ""),
    rationale: trimmed(input.rationale || ""),
    compensation: trimmed(input.compensation || ""),
    postedDate: trimmed(input.postedDate || ""),
    foundDate: trimmed(input.foundDate || ""),
    verification: trimmed(input.verification || ""),
    fitScore: Number.isFinite(Number(input.fitScore)) ? Number(input.fitScore) : null,
    concerns: trimmed(input.concerns || ""),
    keyQualifications: trimmed(input.keyQualifications || ""),
    keywords: Array.isArray(input.keywords)
      ? input.keywords.map((k) => String(k).trim()).filter(Boolean)
      : typeof input.keywords === "string"
        ? input.keywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean)
        : [],
    status: input.status ? String(input.status) : "new",
    notes: trimmed(input.notes || ""),
    resumeSummary: trimmed(input.resumeSummary || ""),
    resumeBullets: trimmed(input.resumeBullets || ""),
    coverLetter: trimmed(input.coverLetter || ""),
    createdAt: input.createdAt ? String(input.createdAt) : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    appliedAt: input.appliedAt ? String(input.appliedAt) : "",
  };
  return out;
}

function upsertByLinkOrTitleCompany(jobs, job) {
  const keyLink = (job.link || "").toLowerCase();
  if (keyLink) {
    const idx = jobs.findIndex((j) => (j.link || "").toLowerCase() === keyLink);
    if (idx >= 0) {
      const prev = jobs[idx];
      jobs[idx] = {
        ...prev,
        ...job,
        id: prev.id,
        createdAt: prev.createdAt,
        status: prev.status || job.status,
        notes: prev.notes || job.notes,
        appliedAt: prev.appliedAt || job.appliedAt,
        updatedAt: new Date().toISOString(),
      };
      return { action: "updated", job: jobs[idx] };
    }
  }
  const key = `${(job.company || "").toLowerCase()}::${(job.title || "").toLowerCase()}`;
  if (key !== "::") {
    const idx = jobs.findIndex(
      (j) => `${(j.company || "").toLowerCase()}::${(j.title || "").toLowerCase()}` === key,
    );
    if (idx >= 0) {
      const prev = jobs[idx];
      jobs[idx] = {
        ...prev,
        ...job,
        id: prev.id,
        createdAt: prev.createdAt,
        status: prev.status || job.status,
        notes: prev.notes || job.notes,
        appliedAt: prev.appliedAt || job.appliedAt,
        updatedAt: new Date().toISOString(),
      };
      return { action: "updated", job: jobs[idx] };
    }
  }
  jobs.unshift(job);
  return { action: "inserted", job };
}

function syncFromFeed() {
  const feed = window[FEED_KEY];
  if (!feed || !Array.isArray(feed.jobs)) {
    lastSyncedAt = "";
    return;
  }
  lastSyncedAt = feed.generatedAt || "";
  if (!feed.jobs.length) return;

  const db = loadDb();
  let changed = false;

  for (const item of feed.jobs) {
    const incoming = normalizeJob(item || {});
    if (!incoming.company || !incoming.title) continue;
    if (incoming.link && isBlockedLink(incoming.link)) continue;

    const r = upsertByLinkOrTitleCompany(db.jobs, incoming);
    const idx = db.jobs.findIndex((j) => j.id === r.job.id);
    if (idx < 0) continue;

    // Never overwrite user-managed fields on feed sync.
    const prev = db.jobs[idx];
    db.jobs[idx] = {
      ...prev,
      status: prev.status,
      notes: prev.notes,
      appliedAt: prev.appliedAt,
      resumeSummary: prev.resumeSummary,
      resumeBullets: prev.resumeBullets,
      coverLetter: prev.coverLetter,
    };

    if (r.action === "inserted" || r.action === "updated") changed = true;
  }

  if (changed) saveDb(db);
}

function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function scorePill(score) {
  if (score == null || Number.isNaN(Number(score))) return "";
  const v = Number(score);
  const cls = v >= 8.8 ? "good" : v >= 7.5 ? "warn" : "bad";
  return `<span class="pill ${cls}">Fit: ${v.toFixed(1)}/10</span>`;
}

function scoreBadge(score) {
  if (score == null || Number.isNaN(Number(score))) return "";
  const v = Number(score);
  return `<div class="score-badge" title="Fit score">
    <div>
      <div class="n">${escapeHtml(v.toFixed(1))}</div>
      <div class="t">Fit / 10</div>
    </div>
  </div>`;
}

function linkControls(job) {
  if (!job.link) return `<span class="pill">No link</span>`;
  return `<button class="linkbtn" data-act="copyLink" data-id="${escapeHtml(job.id)}" title="Copy official link">Copy link</button>`;
}

function toBulletItems(text) {
  const raw = String(text || "").trim();
  if (!raw) return [];
  const normalized = raw.replace(/\s+/g, " ").replace(/•/g, " - ");
  const parts = normalized
    .split(/\n+|(?:\s*;\s*)|(?:\s-\s)/g)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length >= 2) return parts;
  // fallback split by sentences (keep it conservative)
  return normalized
    .split(/(?<=[.。!？?])\s+/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function bulletsHtml(items, tone) {
  if (!items.length) return `<div class="empty">—</div>`;
  const cls = tone ? `bullets ${tone}` : "bullets";
  return `<ul class="${cls}">${items.map((it) => `<li>${escapeHtml(it)}</li>`).join("")}</ul>`;
}

function codingRequirementLabel(job) {
  const text = `${job.synopsis || ""}\n${job.keyQualifications || ""}\n${job.concerns || ""}`.toLowerCase();
  const strong = /(must|required).*(code|coding|python|java|typescript|implement|develop)/.test(text);
  const weak = /(nice to have|helpful|preferred).*(python|code|coding|api)/.test(text);
  const agentic = text.includes("build an ai agent") || text.includes("vibe coding");
  if (strong || agentic) return "Hands-on coding: likely";
  if (weak) return "Hands-on coding: possible";
  return "Hands-on coding: unlikely";
}

function extractKeyQualifications(job) {
  if (job.keyQualifications) return toBulletItems(job.keyQualifications);
  const text = `${job.synopsis || ""}\n${job.concerns || ""}`.toLowerCase();
  const items = [];
  const years = text.match(/(\d+)\s*(?:\+?\s*)?(?:years|yrs)\b/);
  if (years) items.push(`${years[1]}+ years experience`);
  const skillWords = [
    "sql",
    "jira",
    "confluence",
    "tableau",
    "excel",
    "trust & safety",
    "risk",
    "integrity",
    "policy",
    "compliance",
    "escalations",
    "incident",
    "sevs",
    "vendor",
    "governance",
    "portfol",
  ];
  for (const w of skillWords) {
    if (text.includes(w) && !items.some((i) => i.toLowerCase().includes(w.replace("&", "and")))) {
      // keep short, user-facing labels
      const label =
        w === "sevs"
          ? "Incident/SEV response"
          : w === "portfol"
            ? "Portfolio / intake management"
            : w.replace(/\b\w/g, (c) => c.toUpperCase());
      items.push(label);
    }
  }
  items.push(codingRequirementLabel(job));
  return items.slice(0, 6);
}

function statusPill(status) {
  const label = status || "new";
  const cls =
    label === "applied"
      ? "good"
      : label === "interested"
        ? "warn"
        : label === "archived"
          ? "bad"
          : label === "needs_review"
            ? "warn"
            : "";
  return `<span class="pill ${cls}">Status: ${escapeHtml(label)}</span>`;
}

function fmtDate(d) {
  return String(d || "").slice(0, 10);
}

function matchJob(job, q, status) {
  if (status && (job.status || "new") !== status) return false;
  if (!q) return true;
  const hay = [
    job.company,
    job.title,
    job.location,
    job.synopsis,
    job.rationale,
    job.concerns,
    job.compensation,
    job.verification,
    job.notes,
    job.resumeSummary,
    job.resumeBullets,
    job.coverLetter,
    (job.keywords || []).join(", "),
  ]
    .filter(Boolean)
    .join(" | ")
    .toLowerCase();
  return hay.includes(q.toLowerCase());
}

function shouldHideByApplied(job) {
  if (!els.hideApplied?.checked) return false;
  return (job.status || "new") === "applied";
}

function isUsOrChinaLocation(location) {
  const s = String(location || "").toLowerCase();
  if (!s) return false;
  if (s.includes("china") || s.includes("中国")) return true;
  if (
    s.includes("united states") ||
    s.includes("u.s.") ||
    s.includes("usa") ||
    s.includes("remote us") ||
    s.includes("remote (us") ||
    s.includes(", ca") ||
    s.includes("california") ||
    s.includes("san francisco") ||
    s.includes("los angeles") ||
    s.includes("new york") ||
    s.includes("seattle") ||
    s.includes("austin") ||
    s.includes("boston")
  )
    return true;
  if (/(^|[^a-z])us([^a-z]|$)/.test(s)) return true; // avoid matching "aus"
  return false;
}

function shouldHideByLocation(job) {
  if (!els.usCnOnly?.checked) return false;
  return !isUsOrChinaLocation(job.location);
}

function sortJobs(jobs, sort) {
  const arr = jobs.slice();
  if (sort === "company_asc") {
    arr.sort((a, b) => (a.company || "").localeCompare(b.company || ""));
  } else if (sort === "fitScore_desc") {
    arr.sort((a, b) => {
      const bs = Number.isFinite(Number(b.fitScore)) ? Number(b.fitScore) : -1;
      const as = Number.isFinite(Number(a.fitScore)) ? Number(a.fitScore) : -1;
      if (bs !== as) return bs - as;
      const bd = (b.foundDate || b.createdAt || "").toString();
      const ad = (a.foundDate || a.createdAt || "").toString();
      return bd.localeCompare(ad);
    });
  } else {
    // foundDate_desc
    arr.sort((a, b) => {
      const bd = (b.foundDate || b.createdAt || "").toString();
      const ad = (a.foundDate || a.createdAt || "").toString();
      return bd.localeCompare(ad);
    });
  }
  return arr;
}

function render() {
  const q = els.q.value.trim();
  const status = els.status.value;
  const sort = els.sort.value;
  const filtered = allJobs.filter((j) => {
    if (j.link && isBlockedLink(j.link)) return false;
    return !shouldHideByApplied(j) && !shouldHideByLocation(j) && matchJob(j, q, status);
  });
  const sorted = sortJobs(filtered, sort);

  const syncText = lastSyncedAt ? ` · Last synced: ${fmtDate(lastSyncedAt)}` : " · Feed not connected yet";
  const storageText = storageOk ? " · Storage: ok" : " · Storage: blocked (using memory only)";
  const blockedCount = loadBlocked().length;
  const blockedText = blockedCount ? ` · Blocked: ${blockedCount}` : "";
  const feedCount = Array.isArray(window[FEED_KEY]?.jobs) ? window[FEED_KEY].jobs.length : 0;
  const feedText = feedCount ? ` · Feed jobs: ${feedCount}` : " · Feed jobs: 0";
  els.meta.textContent = `${sorted.length} shown · ${allJobs.length} total${syncText}${feedText}${storageText}${blockedText}`;

  if (!sorted.length) {
    const hint =
      lastSyncedAt
        ? "Import JSON or add a job."
        : "Your feed is empty. Update the daily automation to overwrite job-dashboard/public/feed.js, then refresh this page.";
    els.list.innerHTML = `<div class="card job"><div class="job-title">No jobs yet</div><div class="job-sub">${escapeHtml(
      hint,
    )}</div></div>`;
    return;
  }

  els.list.innerHTML = sorted
    .map((job) => {
      const link = linkControls(job);
      const applied = job.appliedAt ? `<span class="pill good">Applied: ${escapeHtml(job.appliedAt)}</span>` : "";

      return `
<article class="card job">
  <div class="job-head">
    <div>
      <div class="job-title">${escapeHtml(job.company)} — ${escapeHtml(job.title)}</div>
      <div class="job-sub">
        ${job.location ? `<span class="pill">${escapeHtml(job.location)}</span>` : ""}
        ${job.foundDate ? `<span class="pill">Found: ${escapeHtml(fmtDate(job.foundDate))}</span>` : ""}
        ${job.postedDate ? `<span class="pill">Posted: ${escapeHtml(fmtDate(job.postedDate))}</span>` : ""}
        ${job.compensation ? `<span class="pill">Comp: ${escapeHtml(job.compensation)}</span>` : ""}
        ${applied}
        ${link}
      </div>
    </div>
    <div>
      ${scoreBadge(job.fitScore)}
      <div class="job-actions" style="margin-top:10px;">
        <button class="btn primary" data-act="prep" data-id="${escapeHtml(job.id)}">Prepare</button>
        <button class="btn" data-act="markNeedsReview" data-id="${escapeHtml(job.id)}">Needs review</button>
        <button class="btn" data-act="toggleInterested" data-id="${escapeHtml(job.id)}">${
          (job.status || "new") === "interested" ? "Unmark interested" : "Mark interested"
        }</button>
        <button class="btn" data-act="markApplied" data-id="${escapeHtml(job.id)}">Mark applied</button>
        <button class="btn" data-act="dismiss" data-id="${escapeHtml(job.id)}" title="Hide this job forever">Dismiss</button>
      </div>
    </div>
  </div>
  <div class="job-body">
    <div class="box">
      <h4>Role Summary</h4>
      <p>${escapeHtml(job.synopsis || "")}</p>
    </div>
    <div class="box">
      <h4>Key Qualifications</h4>
      ${bulletsHtml(extractKeyQualifications(job), "good")}
    </div>
    <div class="box">
      <h4>Why Fits</h4>
      ${bulletsHtml(toBulletItems(job.rationale), "good")}
    </div>
    <div class="box">
      <h4>Concerns / Gaps / Notes</h4>
      ${bulletsHtml(toBulletItems(job.concerns || job.notes), "warn")}
    </div>
  </div>
</article>`;
    })
    .join("\n");
}

async function api(method, url, body) {
  // Serverless mode: emulate API in-memory + localStorage
  const db = loadDb();
  if (method === "GET" && url === "/api/jobs") {
    return { jobs: db.jobs };
  }
  if (method === "POST" && url === "/api/jobs") {
    const job = normalizeJob(body || {});
    if (!job.company || !job.title) throw new Error("company and title are required");
    upsertByLinkOrTitleCompany(db.jobs, job);
    saveDb(db);
    return { ok: true, job };
  }
  if (method === "POST" && url === "/api/jobs/import") {
    const arr = Array.isArray(body) ? body : body?.jobs;
    if (!Array.isArray(arr)) throw new Error("Expected JSON array (or {jobs:[...]})");
    const results = { inserted: 0, updated: 0, errors: 0 };
    for (const item of arr) {
      try {
        const job = normalizeJob(item || {});
        if (!job.company || !job.title) {
          results.errors += 1;
          continue;
        }
        const r = upsertByLinkOrTitleCompany(db.jobs, job);
        if (r.action === "inserted") results.inserted += 1;
        else results.updated += 1;
      } catch {
        results.errors += 1;
      }
    }
    saveDb(db);
    return { ok: true, results };
  }
  if (method === "PATCH" && url.startsWith("/api/jobs/")) {
    const id = decodeURIComponent(url.split("/").pop());
    const idx = db.jobs.findIndex((j) => j.id === id);
    if (idx < 0) throw new Error("Not found");
    const prev = db.jobs[idx];
    const next = normalizeJob({ ...prev, ...(body || {}), id: prev.id, createdAt: prev.createdAt });
    if ((body || {}).status === "applied" && !prev.appliedAt) next.appliedAt = new Date().toISOString().slice(0, 10);
    if ((body || {}).status && (body || {}).status !== "applied") next.appliedAt = prev.appliedAt;
    db.jobs[idx] = { ...next, updatedAt: new Date().toISOString() };
    saveDb(db);
    return { ok: true, job: db.jobs[idx] };
  }
  if (method === "DELETE" && url.startsWith("/api/jobs/")) {
    const id = decodeURIComponent(url.split("/").pop());
    const before = db.jobs.length;
    db.jobs = db.jobs.filter((j) => j.id !== id);
    if (db.jobs.length === before) throw new Error("Not found");
    saveDb(db);
    return { ok: true };
  }
  throw new Error(`Unknown route: ${method} ${url}`);
}

async function refresh() {
  const data = await api("GET", "/api/jobs");
  allJobs = data.jobs || [];
  render();
}

async function patchJob(id, patch) {
  await api("PATCH", `/api/jobs/${encodeURIComponent(id)}`, patch);
  await refresh();
}

els.btnRefresh.addEventListener("click", () => refresh().catch(alert));
els.q.addEventListener("input", () => render());
els.status.addEventListener("change", () => render());
els.sort.addEventListener("change", () => render());
els.hideApplied?.addEventListener("change", () => render());
els.usCnOnly?.addEventListener("change", () => render());

els.btnImport.addEventListener("click", () => {
  els.importText.value = "";
  els.dlgImport.showModal();
});

els.btnExportInbox.addEventListener("click", async () => {
  const inbox = (allJobs || []).filter((j) => (j.status || "new") === "needs_review");
  const payload = inbox.map((j) => ({
    company: j.company,
    title: j.title,
    link: j.link,
    notes: j.notes || "",
    foundDate: j.foundDate || "",
  }));
  const text = JSON.stringify(payload, null, 2);
  try {
    await navigator.clipboard.writeText(text);
    alert(`Copied ${payload.length} inbox jobs to clipboard.`);
  } catch {
    window.prompt("Copy inbox JSON:", text);
  }
});

els.btnExportAll.addEventListener("click", async () => {
  const db = loadDb();
  const text = JSON.stringify(db, null, 2);
  try {
    await navigator.clipboard.writeText(text);
    alert(`Copied ${db.jobs.length} jobs (full backup) to clipboard.`);
  } catch {
    window.prompt("Copy full backup JSON:", text);
  }
});

els.btnCopyApplied?.addEventListener("click", () => copyAppliedLinks().catch(alert));

els.btnCopyBlocked?.addEventListener("click", async () => {
  const list = loadBlocked();
  const text = list.join("\n");
  try {
    await navigator.clipboard.writeText(text);
    alert(`Copied ${list.length} blocked links to clipboard.`);
  } catch {
    window.prompt("Copy blocked links:", text);
  }
});

// Make it easy to create a persistent "already applied" list for the automation:
// copy all applied links to clipboard (user can paste into a file).
async function copyAppliedLinks() {
  const applied = (allJobs || [])
    .filter((j) => (j.status || "new") === "applied" && j.link)
    .map((j) => j.link.trim())
    .filter(Boolean);
  const text = applied.join("\n");
  try {
    await navigator.clipboard.writeText(text);
    alert(`Copied ${applied.length} applied links to clipboard.`);
  } catch {
    window.prompt("Copy applied links:", text);
  }
}

// Shift-click Add job => quick-add from link
els.btnDoImport.addEventListener("click", async (e) => {
  e.preventDefault();
  const raw = els.importText.value.trim();
  if (!raw) return els.dlgImport.close();
  const parsed = JSON.parse(raw);
  await api("POST", "/api/jobs/import", parsed);
  els.dlgImport.close();
  await refresh();
});

els.btnQuick.addEventListener("click", () => {
  els.quickForm.reset();
  els.dlgQuick.showModal();
});

els.btnAdd.addEventListener("click", () => {
  els.addForm.reset();
  els.fFound.value = new Date().toISOString().slice(0, 10);
  els.dlgAdd.showModal();
});

els.quickForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    company: els.qCompany.value || "(Unspecified)",
    title: els.qTitle.value || "(Unspecified role)",
    link: els.qLink.value,
    notes: els.qNotes.value,
    foundDate: new Date().toISOString().slice(0, 10),
    status: "needs_review",
    verification: "Unverified (submitted by user); needs official-page check",
  };
  await api("POST", "/api/jobs", payload);
  els.dlgQuick.close();
  await refresh();
});

els.addForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    company: els.fCompany.value,
    title: els.fTitle.value,
    location: els.fLocation.value,
    link: els.fLink.value,
    foundDate: els.fFound.value,
    fitScore: els.fFit.value ? Number(els.fFit.value) : null,
    compensation: els.fComp.value,
    verification: els.fVerif.value,
    synopsis: els.fSyn.value,
    rationale: els.fWhy.value,
    concerns: els.fConc.value,
    keywords: els.fKeys.value,
  };
  await api("POST", "/api/jobs", payload);
  els.dlgAdd.close();
  await refresh();
});

els.list.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-act]");
  if (!btn) return;
  const id = btn.getAttribute("data-id");
  const act = btn.getAttribute("data-act");

  if (act === "copyLink") {
    const job = allJobs.find((j) => j.id === id);
    const url = (job?.link || "").trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      alert(`This link doesn't look like a normal URL:\n${url}`);
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      alert(`Copied link:\n${url}`);
    } catch {
      window.prompt("Copy link:", url);
    }
    return;
  }

  if (act === "dismiss") {
    const job = allJobs.find((j) => j.id === id);
    const url = (job?.link || "").trim();
    if (url) blockLink(url);
    // Remove from current DB so it disappears immediately.
    await api("DELETE", `/api/jobs/${encodeURIComponent(id)}`);
    await refresh();
    return;
  }

  if (act === "prep") {
    window.location.href = `./prep.html?id=${encodeURIComponent(id)}`;
    return;
  }

  if (act === "markNeedsReview") {
    await patchJob(id, { status: "needs_review" });
    return;
  }

  if (act === "toggleInterested") {
    const job = allJobs.find((j) => j.id === id);
    const next = (job?.status || "new") === "interested" ? "new" : "interested";
    await patchJob(id, { status: next });
    return;
  }

  if (act === "markApplied") {
    await patchJob(id, { status: "applied" });
    return;
  }

  if (act === "archive") {
    await patchJob(id, { status: "archived" });
    return;
  }

  if (act === "delete") {
    // legacy action name (backward compatibility)
    if (!confirm("Delete this job?")) return;
    await api("DELETE", `/api/jobs/${encodeURIComponent(id)}`);
    await refresh();
  }
});

// Docs/Notes modal removed in favor of a dedicated prep page.

try {
  syncFromFeed();
} catch {
  // ignore feed errors
}
refresh().catch((err) => alert(err.message || String(err)));
