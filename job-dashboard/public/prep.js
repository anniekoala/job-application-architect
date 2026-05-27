const STORAGE_KEY = "job_dashboard_db_v1";

function safeJsonParse(s) {
  try {
    return { ok: true, value: JSON.parse(s) };
  } catch (e) {
    return { ok: false, error: String(e?.message || e) };
  }
}

function loadDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { schema: 1, jobs: [] };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { schema: 1, jobs: [] };
    if (!Array.isArray(parsed.jobs)) parsed.jobs = [];
    return parsed;
  } catch {
    return { schema: 1, jobs: [] };
  }
}

function saveDb(db) {
  db.lastSavedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function byId(db, id) {
  return (db.jobs || []).find((j) => j.id === id);
}

function findInFeed(id) {
  const feedJobs = window.__JOB_FEED__?.jobs || [];
  return feedJobs.find((j) => j.id === id) || null;
}

function qs(name) {
  return new URLSearchParams(window.location.search).get(name) || "";
}

function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const els = {
  title: document.getElementById("title"),
  sub: document.getElementById("sub"),
  warn: document.getElementById("warn"),
  resumeSummary: document.getElementById("resumeSummary"),
  resumeBullets: document.getElementById("resumeBullets"),
  coverLetter: document.getElementById("coverLetter"),
  notes: document.getElementById("notes"),
  btnSave: document.getElementById("btnSave"),
  btnMarkApplied: document.getElementById("btnMarkApplied"),
  btnCopyLink: document.getElementById("btnCopyLink"),
  btnExport: document.getElementById("btnExport"),
  btnImport: document.getElementById("btnImport"),
};

const id = qs("id");
const db = loadDb();
let job = (id && byId(db, id)) || null;
if (!job && id) job = findInFeed(id);

if (!job) {
  els.title.textContent = "Job not found";
  els.sub.textContent = "Return to dashboard and click Prepare again.";
} else {
  els.title.textContent = `${job.company} — ${job.title}`;
  const parts = [];
  if (job.location) parts.push(`<span class="pill">${escapeHtml(job.location)}</span>`);
  if (job.compensation) parts.push(`<span class="pill">Comp: ${escapeHtml(job.compensation)}</span>`);
  if (job.link) parts.push(`<span class="pill">Link: ${escapeHtml(job.link)}</span>`);
  els.sub.innerHTML = parts.join(" ");

  els.resumeSummary.value = job.resumeSummary || "";
  els.resumeBullets.value = job.resumeBullets || "";
  els.coverLetter.value = job.coverLetter || "";
  els.notes.value = job.notes || "";

  // Warn if localStorage is blocked (file:// webviews often do this)
  try {
    localStorage.setItem("__test__", "1");
    localStorage.removeItem("__test__");
  } catch {
    els.warn.style.display = "block";
    els.warn.textContent =
      "Storage appears blocked in this in-app view. Your edits may not persist after refresh. Use Export materials to keep a backup (or open this dashboard in Chrome/Safari).";
  }
}

function updateJobFields(targetJob) {
  targetJob.resumeSummary = els.resumeSummary.value;
  targetJob.resumeBullets = els.resumeBullets.value;
  targetJob.coverLetter = els.coverLetter.value;
  targetJob.notes = els.notes.value;
  targetJob.updatedAt = new Date().toISOString();
}

function ensureInDb() {
  const currentDb = loadDb();
  const idx = (currentDb.jobs || []).findIndex((j) => j.id === job.id);
  if (idx >= 0) return { db: currentDb, idx };
  currentDb.jobs = currentDb.jobs || [];
  currentDb.jobs.unshift({ ...job });
  return { db: currentDb, idx: 0 };
}

els.btnSave.addEventListener("click", () => {
  if (!job) return;
  const { db: currentDb, idx } = ensureInDb();
  updateJobFields(currentDb.jobs[idx]);
  saveDb(currentDb);
  alert("Saved.");
});

els.btnMarkApplied.addEventListener("click", () => {
  if (!job) return;
  const { db: currentDb, idx } = ensureInDb();
  currentDb.jobs[idx].status = "applied";
  if (!currentDb.jobs[idx].appliedAt) currentDb.jobs[idx].appliedAt = new Date().toISOString().slice(0, 10);
  updateJobFields(currentDb.jobs[idx]);
  saveDb(currentDb);
  alert("Marked applied.");
});

els.btnCopyLink.addEventListener("click", async () => {
  const url = (job?.link || "").trim();
  if (!url) return alert("No link.");
  try {
    await navigator.clipboard.writeText(url);
    alert(`Copied link:\n${url}`);
  } catch {
    window.prompt("Copy link:", url);
  }
});

els.btnExport.addEventListener("click", async () => {
  if (!job) return;
  const payload = {
    id: job.id,
    link: job.link || "",
    company: job.company || "",
    title: job.title || "",
    resumeSummary: els.resumeSummary.value,
    resumeBullets: els.resumeBullets.value,
    coverLetter: els.coverLetter.value,
    notes: els.notes.value,
    exportedAt: new Date().toISOString(),
  };
  const text = JSON.stringify(payload, null, 2);
  try {
    await navigator.clipboard.writeText(text);
    alert("Exported materials JSON to clipboard.");
  } catch {
    window.prompt("Copy materials JSON:", text);
  }
});

els.btnImport.addEventListener("click", () => {
  const raw = window.prompt("Paste materials JSON:");
  if (!raw) return;
  const parsed = safeJsonParse(raw);
  if (!parsed.ok) return alert(parsed.error);
  const v = parsed.value || {};
  els.resumeSummary.value = v.resumeSummary || "";
  els.resumeBullets.value = v.resumeBullets || "";
  els.coverLetter.value = v.coverLetter || "";
  els.notes.value = v.notes || "";
});

