import http from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 4317);
const DATA_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "db.json");
const PUBLIC_DIR = path.join(__dirname, "public");

function json(res, status, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(body);
}

function text(res, status, body, contentType = "text/plain; charset=utf-8") {
  res.writeHead(status, { "content-type": contentType, "cache-control": "no-store" });
  res.end(body);
}

function safeParseJson(str) {
  try {
    return { ok: true, value: JSON.parse(str) };
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
}

function nowIso() {
  return new Date().toISOString();
}

function newId() {
  // good enough for local usage
  return `job_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

async function loadDb() {
  await mkdir(DATA_DIR, { recursive: true });
  if (!existsSync(DB_PATH)) {
    const empty = { schema: 1, jobs: [] };
    await writeFile(DB_PATH, JSON.stringify(empty, null, 2));
    return empty;
  }
  const raw = await readFile(DB_PATH, "utf8");
  const parsed = safeParseJson(raw);
  if (!parsed.ok || !parsed.value || typeof parsed.value !== "object") {
    const empty = { schema: 1, jobs: [] };
    await writeFile(DB_PATH, JSON.stringify(empty, null, 2));
    return empty;
  }
  if (!Array.isArray(parsed.value.jobs)) parsed.value.jobs = [];
  if (!parsed.value.schema) parsed.value.schema = 1;
  return parsed.value;
}

async function saveDb(db) {
  db.lastSavedAt = nowIso();
  await writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

function normalizeJob(input) {
  const trimmed = (v) => (typeof v === "string" ? v.trim() : v);
  const out = {
    id: input.id && String(input.id) ? String(input.id) : newId(),
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
    keywords: Array.isArray(input.keywords)
      ? input.keywords.map((k) => String(k).trim()).filter(Boolean)
      : typeof input.keywords === "string"
        ? input.keywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean)
        : [],
    status: input.status ? String(input.status) : "new", // needs_review | new | interested | applied | archived
    notes: trimmed(input.notes || ""),
    createdAt: input.createdAt ? String(input.createdAt) : nowIso(),
    updatedAt: nowIso(),
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
        updatedAt: nowIso(),
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
        updatedAt: nowIso(),
      };
      return { action: "updated", job: jobs[idx] };
    }
  }
  jobs.unshift(job);
  return { action: "inserted", job };
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 2_000_000) req.destroy(); // 2MB safety
    });
    req.on("end", () => resolve(data));
  });
}

function extToContentType(ext) {
  switch (ext) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
      return "text/javascript; charset=utf-8";
    case ".png":
      return "image/png";
    case ".svg":
      return "image/svg+xml; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let pathname = url.pathname;
  if (pathname === "/") pathname = "/index.html";
  const fsPath = path.join(PUBLIC_DIR, pathname);
  if (!fsPath.startsWith(PUBLIC_DIR)) return text(res, 400, "Bad path");
  if (!existsSync(fsPath)) return text(res, 404, "Not found");
  const buf = await readFile(fsPath);
  const ct = extToContentType(path.extname(fsPath).toLowerCase());
  res.writeHead(200, { "content-type": ct, "cache-control": "no-store" });
  res.end(buf);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith("/api/")) {
      const db = await loadDb();

      if (req.method === "GET" && url.pathname === "/api/health") {
        return json(res, 200, { ok: true, now: nowIso(), jobs: db.jobs.length });
      }

      if (req.method === "GET" && url.pathname === "/api/jobs") {
        return json(res, 200, { jobs: db.jobs });
      }

      if (req.method === "POST" && url.pathname === "/api/jobs") {
        const body = await readBody(req);
        const parsed = safeParseJson(body);
        if (!parsed.ok) return json(res, 400, { error: parsed.error });
        const job = normalizeJob(parsed.value || {});
        if (!job.company || !job.title) {
          return json(res, 400, { error: "company and title are required" });
        }
        upsertByLinkOrTitleCompany(db.jobs, job);
        await saveDb(db);
        return json(res, 200, { ok: true, job });
      }

      if (req.method === "POST" && url.pathname === "/api/jobs/import") {
        const body = await readBody(req);
        const parsed = safeParseJson(body);
        if (!parsed.ok) return json(res, 400, { error: parsed.error });
        const arr = Array.isArray(parsed.value) ? parsed.value : parsed.value?.jobs;
        if (!Array.isArray(arr)) return json(res, 400, { error: "Expected JSON array (or {jobs:[...]})" });
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
        await saveDb(db);
        return json(res, 200, { ok: true, results });
      }

      if (req.method === "PATCH" && url.pathname.startsWith("/api/jobs/")) {
        const id = url.pathname.split("/").pop();
        const idx = db.jobs.findIndex((j) => j.id === id);
        if (idx < 0) return json(res, 404, { error: "Not found" });
        const body = await readBody(req);
        const parsed = safeParseJson(body);
        if (!parsed.ok) return json(res, 400, { error: parsed.error });
        const patch = parsed.value || {};
        const prev = db.jobs[idx];
        const next = normalizeJob({ ...prev, ...patch, id: prev.id, createdAt: prev.createdAt });
        // preserve appliedAt unless explicitly set
        if (patch.status === "applied" && !prev.appliedAt) next.appliedAt = nowIso().slice(0, 10);
        if (patch.status && patch.status !== "applied") next.appliedAt = prev.appliedAt;
        db.jobs[idx] = { ...next, updatedAt: nowIso() };
        await saveDb(db);
        return json(res, 200, { ok: true, job: db.jobs[idx] });
      }

      if (req.method === "DELETE" && url.pathname.startsWith("/api/jobs/")) {
        const id = url.pathname.split("/").pop();
        const before = db.jobs.length;
        db.jobs = db.jobs.filter((j) => j.id !== id);
        if (db.jobs.length === before) return json(res, 404, { error: "Not found" });
        await saveDb(db);
        return json(res, 200, { ok: true });
      }

      return json(res, 404, { error: "Unknown API route" });
    }

    return serveStatic(req, res);
  } catch (err) {
    return json(res, 500, { error: String(err?.message || err) });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  // eslint-disable-next-line no-console
  console.log(`Job dashboard running: http://localhost:${PORT}`);
});
